"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.error("[useAuth] Firebase not configured — missing env vars");
      setError("Firebase not configured");
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        getFirebaseAuth(),
        (firebaseUser) => {
          setUser(firebaseUser);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("[useAuth] Auth state error:", err.code, err.message);
          setError(err.message);
          setLoading(false);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error("[useAuth] Firebase init error:", err);
      setError(err instanceof Error ? err.message : "Firebase init failed");
      setLoading(false);
    }
  }, []);

  return { user, loading, error };
}
