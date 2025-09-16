// src/hooks/useAuthContext.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside an AuthProvider");
  }
  return ctx;
}
