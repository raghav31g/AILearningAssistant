import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import adminService from "../services/adminService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProtectedMode, setIsProtectedMode] = useState(false);

  const fetchProtectedMode = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const data = await adminService.getProtectedModeStatus();
        if (data && typeof data.isProtectedMode === "boolean") {
          setIsProtectedMode(data.isProtectedMode);
        }
      }
    } catch {
      // Ignore if not logged in or endpoint unavail
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        if (!userData.role) {
          userData.role = "student";
        }
        setUser(userData);
        setIsAuthenticated(true);
        fetchProtectedMode();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (userData, token) => {
    const formattedUser = {
      ...userData,
      role: userData.role || "student"
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(formattedUser));

    setUser(formattedUser);
    setIsAuthenticated(true);
    fetchProtectedMode();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    setIsProtectedMode(false);

    window.location.href = "/";
  };

  const updateUser = (updatedUserData) => {
    const newUserData = {
      ...user,
      ...updatedUserData,
      role: updatedUserData.role || user?.role || "student"
    };

    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    const currentRole = user.role || "student";
    return roles.includes(currentRole);
  };

  const isStudent = user?.role === "student" || (!user?.role && isAuthenticated);
  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "administrator";

  const value = {
    user,
    role: user?.role || "student",
    isStudent,
    isTeacher,
    isAdmin,
    hasRole,
    isProtectedMode,
    setIsProtectedMode,
    refreshProtectedMode: fetchProtectedMode,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};