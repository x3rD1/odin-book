import { api } from "../../api/client";

export const getAllPosts = (path) => api.get(path);
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (data) => api.post("/posts/", data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const createLike = (id) => api.post(`/posts/${id}/likes`);
export const deleteLike = (id) => api.delete(`/posts/${id}/likes`);
