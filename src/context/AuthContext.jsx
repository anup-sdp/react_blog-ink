// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState, useCallback } from "react";
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
    // If decode fails, treat token as expired to be safe
    console.error("Failed to decode token expiry:", err);
    return true;
  }
}

export function AuthProvider({ children }) {
  const [authTokens, setAuthTokens] = useState(() => parseStoredToken());
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Persist tokens to localStorage (authApiClient reads from localStorage)
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

  // Fetch current user profile (authApiClient includes Authorization header using localStorage)
  const fetchUserProfile = useCallback(
    async (tokens = null) => {
      const tokensToUse = tokens || authTokens;
      if (!tokensToUse?.access) return;
      try {
        const resp = await authApiClient.get("/auth/users/me/");
        setUser(resp.data);
        return resp.data;
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 && tokensToUse?.refresh) {
          try {
            const newTokens = await refreshAccessToken(tokensToUse.refresh);
            // authApiClient reads localStorage, so retry will include new access token
            const retry = await authApiClient.get("/auth/users/me/");
            setUser(retry.data);
            return retry.data;
          } catch (refreshErr) {
            console.warn("Refresh failed while fetching profile", refreshErr);
            logoutUser();
          }
        } else {
          console.warn("Failed fetching profile", err);
        }
      }
    },
    [authTokens, refreshAccessToken]
  );

  // Initialize on mount: load tokens, refresh if expired, fetch profile
  useEffect(() => {
    let mounted = true;
    (async () => {
      const tokens = parseStoredToken();
      if (!tokens) {
        if (mounted) {
          saveTokens(null);
          setIsLoading(false);
        }
        return;
      }

      // If access token expired, try refresh; otherwise fetch profile
      if (isTokenExpired(tokens.access)) {
        try {
          const newTokens = await refreshAccessToken(tokens.refresh);
          if (mounted) await fetchUserProfile(newTokens);
        } catch (err) {
          console.log("Token refresh failed during init, logging out");
          saveTokens(null);
          setUser(null);
        } finally {
          if (mounted) setIsLoading(false);
        }
      } else {
        try {
          await fetchUserProfile(tokens);
        } finally {
          if (mounted) setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login
  const loginUser = async (credentials) => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      const resp = await apiClient.post("/auth/jwt/create/", credentials);
      const tokens = resp.data; // { refresh: "...", access: "..." }
      saveTokens(tokens); // authApiClient will read from localStorage for subsequent calls
      await fetchUserProfile(tokens);
      return { success: true };
    } catch (err) {
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

  // Logout (clear tokens and redirect to /login)
  const logoutUser = useCallback(() => {
    saveTokens(null);
    setUser(null);
    setErrorMsg("");
    // redirect to login. using window.location because provider usually wraps Router.
    window.location.replace("/login");
  }, [saveTokens]);

  // Update profile
  const updateUserProfile = async (data) => {
    setErrorMsg("");
    try {
      await authApiClient.patch("/auth/users/me/", data, {
        headers: { "Content-Type": "application/json" },
      });
      setUser((prev) => ({ ...prev, ...data }));
      return { success: true };
    } catch (err) {
      const message =
        Object.values(err?.response?.data || {}).flat?.().join("\n") || "Update failed";
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

  // Resend activation, reset password flows
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
