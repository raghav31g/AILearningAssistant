import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const normalizeError = (error, defaultMsg = "An error occurred") => {
  const errorData = error.response?.data;
  const message =
    errorData?.error ||
    errorData?.message ||
    (error.code === "ERR_NETWORK"
      ? "Cannot connect to server. Please check your network and ensure the backend is running."
      : error.message) ||
    defaultMsg;
  return {
    ...errorData,
    message,
    error: message,
    statusCode: error.response?.status || 500,
  };
};

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to login. Please check your credentials.");
  }
};

const register = async (username, email, password, role = "student") => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password,
      role,
    });

    return response.data;
  } catch (error) {
    throw normalizeError(error, "Registration failed. Please try again.");
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);

    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to fetch profile");
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      userData
    );

    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to update profile");
  }
};

const changePassword = async (passwords) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwords
    );

    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to change password");
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;