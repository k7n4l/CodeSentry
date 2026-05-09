import React, {
  createContext,
  useState,
  useEffect,
  useContext
} from "react";

import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  // Configure axios default headers
  useEffect(() => {

    if (token) {

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      getCurrentUser();

    } else {

      setLoading(false);
    }

  }, [token]);

  // Get logged in user
  const getCurrentUser = async () => {

    try {

      const response = await axios.get(
        "http://localhost:3001/auth/me"
      );

      setUser(response.data.user);

    } catch (error) {

      console.error("Failed to get user", error);

      logout();

    } finally {

      setLoading(false);
    }
  };

  const login = async (email, password) => {

    const response = await axios.post(
      "http://localhost:3001/auth/login",
      {
        email,
        password
      }
    );

    const { token, user } = response.data;

    localStorage.setItem("token", token);

    setToken(token);

    setUser(user);

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;

    return response.data;
  };


  const register = async (
    name,
    email,
    password
  ) => {

    const response = await axios.post(
      "http://localhost:3001/auth/register",
      {
        name,
        email,
        password
      }
    );

    const { token, user } = response.data;

    localStorage.setItem("token", token);

    setToken(token);

    setUser(user);

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;

    return response.data;
  };

  // Logout
  const logout = () => {

    localStorage.removeItem("token");

    setToken(null);

    setUser(null);

    delete axios.defaults.headers.common[
      "Authorization"
    ];
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    token,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};