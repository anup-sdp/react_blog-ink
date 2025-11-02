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

// Decode JWT and check expiry
function isTokenExpired(token) {
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

function getRefreshToken(tokens) {
  if (tokens?.refresh) return tokens.refresh;
  if (tokens?.refresh_token) return tokens.refresh_token; // Alternative key name
  return null;
}

export function AuthProvider({ children }) { // -----------------------------------------------
  const navigate = useNavigate();
  const [authTokens, setAuthTokens] = useState(() => parseStoredToken());
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
    setAuthTokens(tokens);
  }, []);

  // Refresh access token using refresh token -----------------------------
  const refreshAccessToken = useCallback(
    async (refreshToken) => {
      if (!refreshToken) throw new Error("No refresh token available");
      const resp = await apiClient.post("/auth/jwt/refresh/", { refresh: refreshToken });
      const newTokens = { ...authTokens, access: resp.data.access };
      saveTokens(newTokens);
      return newTokens;
    },
    [authTokens, saveTokens]
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
    async (tokens = null) => {
      const tokensToUse = tokens || authTokens;
      if (!tokensToUse?.access) {
        throw new Error("No access token available");
      }
      
      try {
        console.log("Fetching user profile..."); // ------- printing repeatedly
        const resp = await authApiClient.get("/auth/users/me/");
        console.log("Profile fetch successful:", resp.data);
        setUser(resp.data);
        return resp.data;
      } catch (err) {
        console.log("Profile fetch failed:", err?.response?.status, err?.response?.data);
        const status = err?.response?.status;
        
        if (status === 401) {
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
              
              logoutUser();
              throw refreshErr;
            }
          } else {
            console.warn("No valid refresh token, logging out");
            
            // Set user-friendly error message  
            setErrorMsg("Your session has expired. Please log in again.");
            
            logoutUser();
            throw err;
          }
        } else if (status === 500) {
          // Set server error message
          setErrorMsg("Server error. Please try again later.");
        } else if (err.message === "Network Error") {
          // Set network error message
          setErrorMsg("Connection error. Please check your internet connection.");
        } else {
          // Set generic error message
          setErrorMsg("Failed to load user profile. Please try again.");
        }
        
        console.warn("Failed fetching profile", err);
        throw err;
      }
    },
    [authTokens, refreshAccessToken]  // , logoutUser
	// ^ for using useCallback Only recreated when dependencies change, instead of recreated on every render
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
        console.log("Profile fetch after login failed, but login was successful");
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
    user, authTokens, errorMsg, isLoading,
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
