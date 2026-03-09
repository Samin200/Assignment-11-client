import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../Firebase/firebase.init";
import { AuthContext } from "./AuthContext";
import { useState, useEffect } from "react";
import api from "../utilitys/api";

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("isDarkMode")) || false
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Sync firebase user → backend to get role ────────────────────────────────
  const syncUser = async (firebaseUser) => {
    try {
      const res = await api.post("/api/user", {
        uid:         firebaseUser.uid,
        email:       firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL:    firebaseUser.photoURL,
      });
      return { ...firebaseUser, role: res.data.role || "user" };
    } catch (err) {
      console.error("Failed to sync user role:", err);
      return { ...firebaseUser, role: "user" };
    }
  };

  // ── Auth state listener ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const enhancedUser = await syncUser(firebaseUser);
        setUser(enhancedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── CREATE USER (email/password) ────────────────────────────────────────────
  const createUser = async (email, password, firstName, lastName, photoURL = null) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`.trim(),
        ...(photoURL && { photoURL })
      });

      // Sync to backend — onAuthStateChanged will also fire but we set here too
      const enhancedUser = await syncUser({ ...result.user, displayName: `${firstName} ${lastName}`.trim(), photoURL });
      setUser(enhancedUser);
      return enhancedUser;
    } catch (err) {
      console.error("Create user error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── LOGIN (email/password) ──────────────────────────────────────────────────
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const enhancedUser = await syncUser(result.user);
      setUser(enhancedUser);
      return enhancedUser;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── GOOGLE SIGN IN ──────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const enhancedUser = await syncUser(result.user);
      setUser(enhancedUser);
      return enhancedUser;
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── LOGOUT ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const AuthInfo = {
    user,
    loading,
    isDarkMode,
    setIsDarkMode,
    createUser,
    loginWithEmail,
    loginWithGoogle,   // ✅ exposed
    logout,
    setLoading,
    setUser,
  };

  return <AuthContext.Provider value={AuthInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;