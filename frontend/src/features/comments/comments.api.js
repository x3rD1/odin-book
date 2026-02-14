import { api } from "../../api/client";

export const getComments = (path) => api.get(path);
export const createComment = (postId, data) =>
  api.post(`/posts/${postId}/comments`, data);
export const getReplies = (postId, commentId) =>
  api.get(`/posts/${postId}/comments/${commentId}/replies`);
export const createReply = (postId, commentId, data) =>
  api.post(`/posts/${postId}/comments/${commentId}/replies`, data);
export const createLike = (postId, commentId) =>
  api.post(`/posts/${postId}/comments/${commentId}/likes`);
export const deleteLike = (postId, commentId) => {
  api.delete(`/posts/${postId}/comments/${commentId}/likes`);
};
export const updateComment = (postId, commentId, data) =>
  api.put(`/posts/${postId}/comments/${commentId}`, data);
export const deleteComment = (postId, commentId) => {
  api.delete(`/posts/${postId}/comments/${commentId}`);
};
