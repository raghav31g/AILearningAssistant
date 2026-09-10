import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getAllUsers = async (params = {}) => {
  try {
    const response = await axiosInstance.get(API_PATHS.ADMIN.GET_USERS, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};

const createAdminUser = async (userData) => {
  try {
    const response = await axiosInstance.post(API_PATHS.ADMIN.CREATE_USER, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create user" };
  }
};

const updateUserRole = async (userId, role) => {
  try {
    const response = await axiosInstance.put(API_PATHS.ADMIN.UPDATE_ROLE(userId), { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update role" };
  }
};

const toggleUserActive = async (userId) => {
  try {
    const response = await axiosInstance.put(API_PATHS.ADMIN.TOGGLE_ACTIVE(userId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to toggle user status" };
  }
};

const getSystemStats = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.ADMIN.GET_STATS);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch system stats" };
  }
};

const getProtectedModeStatus = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.ADMIN.GET_PROTECTED_MODE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch protected mode status" };
  }
};

const toggleProtectedMode = async (enabled) => {
  try {
    const response = await axiosInstance.put(API_PATHS.ADMIN.TOGGLE_PROTECTED_MODE, { enabled });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to toggle protected mode" };
  }
};

// Teacher endpoints
const getStudents = async (params = {}) => {
  try {
    const response = await axiosInstance.get(API_PATHS.TEACHER.GET_STUDENTS, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch students" };
  }
};

const getStudentProgress = async (studentId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.TEACHER.GET_STUDENT_PROGRESS(studentId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch student progress" };
  }
};

const adminService = {
  getAllUsers,
  createAdminUser,
  updateUserRole,
  toggleUserActive,
  getSystemStats,
  getProtectedModeStatus,
  toggleProtectedMode,
  getStudents,
  getStudentProgress,
};

export default adminService;
