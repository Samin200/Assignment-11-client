import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from "firebase/auth";
import { auth } from "../Firebase/firebase.init";
import { AuthContext } from "./AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

const AuthProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("isDarkMode")) || false
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Sync with backend to get role
          const res = await axios.post("http://localhost:5020/api/user", {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });

          // Enhance Firebase user with role from backend
          const enhancedUser = {
            ...firebaseUser,
            role: res.data.role || "user", // fallback if something goes wrong
          };

          setUser(enhancedUser);
        } catch (err) {
          console.error("Failed to sync user role:", err);
          // Still set user even if backend sync fails
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ CREATE USER
  const createUser = async (email, password, firstName, lastName) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Sync new user with backend
      await axios.post("http://localhost:5020/api/user", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      });

      const enhancedUser = {
        ...result.user,
        role: "user", // new users are always "user"
      };
      setUser(enhancedUser);

      return enhancedUser;
    } catch (err) {
      console.error("Create user error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN (UPDATED)
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Sync with backend to get role
      const res = await axios.post("http://localhost:5020/api/user", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      });

      const enhancedUser = {
        ...result.user,
        role: res.data.role || "user",
      };

      setUser(enhancedUser);
      return enhancedUser;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT
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
    logout,
    setLoading,
    setUser
  };

  return <AuthContext.Provider value={AuthInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;