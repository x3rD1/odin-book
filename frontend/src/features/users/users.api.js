import { api } from "../../api/client";

export const getAllUsers = () => api.get("/users");
export const getUser = (userId) => api.get(`/users/${userId}`);
export const toggleFollow = (userId) => api.post(`/users/${userId}/follow`);
export const followStatus = (userId) =>
  api.get(`/users/${userId}/follow/status`);
export const updateUser = (userId, data) => api.patch(`/users/${userId}`, data);
