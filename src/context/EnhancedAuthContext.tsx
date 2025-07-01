// EnhancedAuthContext.tsx

import { apiService } from "@/services/api";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: string; // Changed from _id to id to match typical frontend naming, but ensure consistency
  name: string;
  email: string;
  photoURL: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    photoURL: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function EnhancedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        // Ensure the parsed user data has an 'id' or '_id' that matches your User interface
        // If your User interface uses 'id' but backend sends '_id', you might need to map it
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiService.login(email, password);
      // Backend returns: { _id, name, email, photoURL, token }
      // We need to construct the user object from the response data
      const loggedInUser: User = {
        id: response._id, // Map _id to id for consistency with User interface
        name: response.name,
        email: response.email,
        photoURL: response.photoURL,
        // role: response.role, // Include if your backend provides a role
      };

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser)); // Store the correctly structured user object
      setUser(loggedInUser);
    } catch (error: any) {
      setError(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    photoURL: string
  ) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiService.register(
        name,
        email,
        password,
        photoURL
      );
      // Backend returns: { _id, name, email, photoURL, token }
      // Construct the user object from the response data
      const registeredUser: User = {
        id: response._id, // Map _id to id for consistency with User interface
        name: response.name,
        email: response.email,
        photoURL: response.photoURL,
        // role: response.role, // Include if your backend provides a role
      };

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(registeredUser)); // Store the correctly structured user object
      setUser(registeredUser);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
