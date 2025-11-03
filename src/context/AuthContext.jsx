// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import apiClient from "../services/api-client";
import authApiClient from "../services/auth-api-client";

export const AuthContext = createContext(null);

const LOCAL_KEY = "authTokens";

function parseStoredToken() {
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : null;
}

function getRefreshToken(tokens) {
  if (tokens?.refresh) return tokens.refresh;
  if (tokens?.refresh_token) return tokens.refresh_token; // Alternative key name
  return null;
}

// Decode JWT and check expiry
function isTokenExpired(token) { // both access and refresh
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    return payload.exp < now;
  } catch (err) {
    console.error("Failed to decode token expiry:", err);
    return true;
  }
}

export function AuthProvider({ children }) { // -----------------------------------------------
  const navigate = useNavigate();  
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Persist tokens to localStorage
  const saveTokens = useCallback((tokens) => {
    if (tokens) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(tokens));
    } else {
      localStorage.removeItem(LOCAL_KEY);
    }    
  }, []);

  // Refresh access token using refresh token -----------------------------
  const refreshAccessToken = useCallback(
    async (refreshTokenParam = null) => {
      const stored = parseStoredToken() || {};
      const refreshToken = refreshTokenParam || getRefreshToken(stored);
      if (!refreshToken) throw new Error("No refresh token available");
  
      try {
        const resp = await apiClient.post("/auth/jwt/refresh/", { refresh: refreshToken });
        // Build new token object using latest stored tokens
        const latest = parseStoredToken() || stored || {};
        const newTokens = {
          ...latest,
          access: resp.data.access,
          // some backends return a new refresh token, some don't:
          refresh: resp.data.refresh || latest.refresh || refreshToken,
        };
        saveTokens(newTokens);
        return newTokens;
      } catch (err) {
        // bubble up so callers can logout etc.
        throw err;
      }
    },
    [saveTokens]
  );

  // Logout -  using navigate instead of window.location.replace
  const logoutUser = useCallback(() => {
    console.log("Logging out user");
    saveTokens(null);
    setUser(null);
    setErrorMsg("");
    // FIX: Use navigate instead of window.location.replace
    navigate("/login", { replace: true });
  }, [saveTokens, navigate]);  
  
  // Fetch current user profile  
  const fetchUserProfile = useCallback( 
    async (tokensParam = null) => {
      const tokensToUse = tokensParam || parseStoredToken();      
	  if (!tokensToUse?.access) throw new Error("No access token available");
      
      try {
        console.log("Fetching user profile..."); ///
        const resp = await authApiClient.get("/auth/users/me/");
        console.log("Profile fetch successful:", resp.data);
        setUser(resp.data);
        return resp.data;
      } catch (err) {
		const status = err?.response?.status;
		console.log("Profile fetch failed:", status, err?.response?.data);        
        
        if (status === 401) { // unauthorized, expied access token
          const refreshToken = getRefreshToken(tokensToUse);
          
          if (refreshToken && !isTokenExpired(refreshToken)) {
            try {
              console.log("Attempting token refresh...");
              const newTokens = await refreshAccessToken(refreshToken); //
              
              const retry = await authApiClient.get("/auth/users/me/");
              console.log("Retry successful after refresh:", retry.data);
              setUser(retry.data);
              return retry.data;
            } catch (refreshErr) {
              console.warn("Token refresh failed:", refreshErr);              
              // Set user-friendly error message
              setErrorMsg("Your session has expired. Please log in again.");              
              logoutUser(); /// ---
              throw refreshErr; // caught by fetchUserProfile caller
            }
          } else {
            console.warn("No valid refresh token, logging out");            
            // Set user-friendly error message  
            setErrorMsg("Your session has expired. Please log in again.");            
            logoutUser(); /// ---
            throw err; // outside try catch ? no when calling fetchUserProfile, its inside try block
          }
        } else if (status === 500) { // server error           
          setErrorMsg("Server error. Please try again later.");
        } else if (err.message === "Network Error") {          
          setErrorMsg("Connection error. Please check your internet connection.");
        } else { // generic error message          
          setErrorMsg("Failed to load user profile. Please try again.");
        }
        
        console.warn("Failed fetching profile", err);
        throw err;
      }
    },
    [refreshAccessToken, logoutUser]  
	// ^ for using useCallback Only recreated when dependencies change, instead of recreated on every render
	// ask: should i include logoutUser in dependency of fetchUserProfile, why
	// React Rule (useCallback): if a useCallback function uses a variable/function from scope, it must be in the dependency array.
	// to avoid stale closure
	// If your effect uses a function defined in the component, include it in the dependency array. Whether or not it’s wrapped in useCallback.
  );

  // Initialize on mount - fixed
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      const tokens = parseStoredToken();
      
      if (!tokens) {
        console.log("No tokens found in localStorage");
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      console.log("Tokens found, checking validity...");
      const accessToken = tokens.access;
      const refreshToken = getRefreshToken(tokens);

      try {
        // If access token is valid, fetch user profile
        if (!isTokenExpired(accessToken)) {
          console.log("Access token valid, fetching profile");
          await fetchUserProfile(tokens);
        }
        // If access token expired but refresh token valid, try to refresh
        else if (refreshToken && !isTokenExpired(refreshToken)) {
          console.log("Access token expired, trying to refresh");
          const newTokens = await refreshAccessToken(refreshToken);
          await fetchUserProfile(newTokens);
        }
        // Both tokens expired
        else {
          console.log("Both tokens expired, clearing");
          saveTokens(null);
          setUser(null);
        }
      } catch (err) {
        console.log("Initialization failed:", err);
        if (mounted) {
          saveTokens(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [refreshAccessToken, fetchUserProfile, saveTokens]); //


  // Login
  const loginUser = async (credentials) => {
    console.log("in AuthContext.jsx for login");
    setErrorMsg("");
    setIsLoading(true);
    
    try {
      const resp = await apiClient.post("/auth/jwt/create/", credentials);
      const tokens = resp.data;
      console.log("Login successful, tokens received");
      
      saveTokens(tokens);
      
      // Try to fetch profile, but don't fail login if it fails
      try {
        await fetchUserProfile(tokens);
        console.log("Profile fetch after login successful");
      } catch (profileErr) {
        console.log("Profile fetch after login failed, but login was successful", profileErr);
        // Profile will be fetched later or on next app load
      }
      
      return { success: true };
    } catch (err) {
      console.log("Login failed:", err?.response?.data);
      const detail = err?.response?.data?.detail || "Login failed";
      setErrorMsg(detail);
      return { success: false, message: detail };
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const registerUser = async (userData) => {
    setErrorMsg("");
    try {
      await apiClient.post("/auth/users/", userData);
      return {
        success: true,
        message: "Registration successful. Check your email to activate your account.",
      };
    } catch (err) {
      const message =
        Object.values(err?.response?.data || {}).flat?.().join("\n") || "Registration failed";
      setErrorMsg(message);
      return { success: false, message };
    }
  };

  // Update profile
  const updateUserProfile = async (data) => {
  setErrorMsg("");
  try {
    const response = await authApiClient.patch("/auth/users/me/", data, {
      headers: { "Content-Type": "application/json" },
    });
    setUser((prev) => ({ ...prev, ...data })); // Update local user state
    return { success: true };
  } catch (err) {
    const message = Object.values(err?.response?.data || {}).flat?.().join("\n") || "Update failed";
    setErrorMsg(message);
    return { success: false, message };
  }
};

  // Change password
  const changePassword = async (payload) => {
    setErrorMsg("");
    try {
      await authApiClient.post("/auth/users/set_password/", payload);
      return { success: true, message: "Password changed" };
    } catch (err) {
      const message =
        Object.values(err?.response?.data || {}).flat?.().join("\n") || "Password change failed";
      setErrorMsg(message);
      return { success: false, message };
    }
  };

  // Other methods...
  const resendActivationEmail = async (email) => {
    try {
      await apiClient.post("/auth/users/resend_activation/", { email });
      return { success: true };
    } catch (err) {
      return { success: false, message: "Failed to send activation email" };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await apiClient.post("/auth/users/reset_password/", { email });
      return { success: true };
    } catch (err) {
      return { success: false, message: "Failed to request password reset" };
    }
  };

  const confirmPasswordReset = async (uid, token, newPassword) => {
    try {
      await apiClient.post("/auth/users/reset_password_confirm/", {
        uid,
        token,
        new_password: newPassword,
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: "Password reset failed" };
    }
  };

  const value = {
    user, errorMsg, isLoading,
    loginUser, registerUser, logoutUser, 
    fetchUserProfile, updateUserProfile, changePassword, resendActivationEmail, requestPasswordReset, confirmPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * note: storing access/refresh tokens in localStorage/sessionStorage is vulnerable to (XSS - Cross-Site Scripting),
 * try using httpOnly cookie - needs backend django modification.
 * if still wanna use them, 
 * use Complete HTML Sanitization in django view/ Django Serializer with Validation/ Middleware for Global Protection/
 * Frontend Protection(React Safe Display)/ sanitize_user_input(text)
 */
