// src/utils/auth.js
export function isAuthenticated() {
  const tokenString = localStorage.getItem("authTokens");
  if (!tokenString) return false;
  
  try {
    const tokens = JSON.parse(tokenString);
    return !!tokens.access;
  } catch (error) {
    return false;
  }
}