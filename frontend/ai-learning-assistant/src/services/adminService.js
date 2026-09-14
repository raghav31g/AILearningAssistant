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
    throw error.response?.data || { message: 'Failed to fetch student progress' };
  }
};

const assignQuiz = async (data) => {
  try {
    const response = await axiosInstance.post(API_PATHS.TEACHER.ASSIGN_QUIZ, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to assign quiz' };
  }
};

const getAssignedQuizzes = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.TEACHER.GET_ASSIGNED_QUIZZES);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch assigned quizzes' };
  }
};

const getAssignedQuizResults = async (templateId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.TEACHER.GET_ASSIGNED_QUIZ_RESULTS(templateId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch quiz results' };
  }
};

const downloadQuizResults = async (templateId, quizTitle) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.TEACHER.DOWNLOAD_QUIZ_RESULTS(templateId),
      { responseType: 'blob' }
    );
    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (quizTitle || 'quiz_results').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${safeTitle}_marks.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error.response?.data || { message: 'Failed to download CSV' };
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
  assignQuiz,
  getAssignedQuizzes,
  getAssignedQuizResults,
  downloadQuizResults,
};

export default adminService;
