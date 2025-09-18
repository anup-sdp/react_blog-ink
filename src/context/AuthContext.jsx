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

export function AuthProvider({ children }) {
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

  // Refresh access token using refresh token
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

  // Logout - now using navigate instead of window.location.replace
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
        console.log("error: no access token!");
        return;
      }
      
      try {
        console.log("Fetching user profile...");
        const resp = await authApiClient.get("/auth/users/me/");
        console.log("Profile fetch successful:", resp.data);
        setUser(resp.data);
        return resp.data;
      } catch (err) {
        console.log("Profile fetch failed:", err?.response?.status, err?.response?.data);
        const status = err?.response?.status;
        
        if (status === 401 && tokensToUse?.refresh && !isTokenExpired(tokensToUse.refresh)) {
          try {
            console.log("Attempting token refresh...");
            const newTokens = await refreshAccessToken(tokensToUse.refresh);
            // Retry with new token
            const retry = await authApiClient.get("/auth/users/me/");
            console.log("Retry successful after refresh:", retry.data);
            setUser(retry.data);
            return retry.data;
          } catch (refreshErr) {
            console.warn("Refresh failed while fetching profile", refreshErr);
            // During login, don't automatically logout - let login handle the error
            throw refreshErr;
          }
        } else {
          console.warn("Failed fetching profile", err);
          throw err;
        }
      }
    },
    [authTokens, refreshAccessToken]
  );

  // Initialize on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const tokens = parseStoredToken();
      if (!tokens) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      // If access token expired, try refresh; otherwise fetch profile
      if (isTokenExpired(tokens.access)) {
        if (!isTokenExpired(tokens.refresh)) {
          try {
            const newTokens = await refreshAccessToken(tokens.refresh);
            if (mounted) await fetchUserProfile(newTokens);
          } catch (err) {
            console.log("Token refresh failed during init, clearing tokens");
            if (mounted) {
              saveTokens(null);
              setUser(null);
            }
          } finally {
            if (mounted) setIsLoading(false);
          }
        } else {
          // Both tokens expired
          console.log("Both tokens expired, clearing");
          if (mounted) {
            saveTokens(null);
            setUser(null);
            setIsLoading(false);
          }
        }
      } else {
        try {
          await fetchUserProfile(tokens);
        } catch (err) {
          console.log("Initial profile fetch failed");
          // Don't clear tokens on initial fetch failure
        } finally {
          if (mounted) setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshAccessToken, fetchUserProfile, saveTokens]);

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
    user,
    authTokens,
    errorMsg,
    isLoading,
    loginUser,
    registerUser,
    logoutUser,
    fetchUserProfile,
    updateUserProfile,
    changePassword,
    resendActivationEmail,
    requestPasswordReset,
    confirmPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}