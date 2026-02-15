import { useCallback, useContext, useEffect, useState } from "react";
import CommentContext from "./CommentContext";
import { socket } from "../utils/socket";
import {
  getComments,
  createLike,
  deleteLike,
  createReply,
  createComment,
  deleteComment,
  updateComment,
} from "../features/comments/comments.api";
import PostsContext from "./PostsContext";
import AuthContext from "../features/auth/AuthContext";

export function CommentProvider({ children }) {
  const { user } = useContext(AuthContext);
  const { incrementCommentCount, decrementCommentCount } =
    useContext(PostsContext);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [nextCursor, setNextCursor] = useState({});
  const [loading, setLoading] = useState({});
  const [hasMore, setHasMore] = useState({});
  const [openModal, setOpenModal] = useState(false);

  const fetchComments = useCallback(
    async (postId, cursorId = null, options = {}) => {
      const { force = false } = options;

      setLoading((prev) => {
        if (!force && prev[postId]) return prev;
        return { ...prev, [postId]: true };
      });

      try {
        const url = cursorId
          ? `/posts/${postId}/comments?cursor=${cursorId}`
          : `/posts/${postId}/comments`;
        const res = await getComments(url);

        setCommentsByPost((prev) => {
          const existing = prev[postId] || [];

          const merged = [...existing, ...res.comments];

          const deduped = Array.from(
            new Map(merged.map((c) => [c.id, c])).values(),
          ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          return {
            ...prev,
            [postId]: deduped,
          };
        });
        setNextCursor((prev) => ({ ...prev, [postId]: res.nextCursor }));
        setHasMore((prev) => ({ ...prev, [postId]: Boolean(res.nextCursor) }));
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoading((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [],
  );

  const onReply = (postId, commentId, username, userId) => {
    const data = {
      postId,
      commentId,
      username,
      userId,
    };
    setReplyTo(data);
  };

  const onCreate = async ({
    postId,
    content,
    authorId,
    mediaUrl,
    mediaId,
    mediaType,
  }) => {
    try {
      if (replyTo?.commentId) {
        const commentAuthorId = replyTo.userId;
        const newReply = await createReply(postId, replyTo.commentId, {
          content,
          mediaUrl,
          mediaId,
          mediaType,
        });

        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: [
            newReply.reply,
            ...(prev[postId] || []).filter((c) => c.id !== newReply.reply.id),
          ],
        }));
        socket.emit("comment_reply", {
          postId,
          commentAuthorId,
          content,
          comment: newReply.reply,
          actor: user,
          notif: newReply.notif,
        });
        incrementCommentCount(postId);
        setReplyTo(null);
        return;
      }

      const newComment = await createComment(postId, {
        content,
        mediaUrl,
        mediaId,
        mediaType,
      });

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [newComment.comment, ...(prev[postId] || [])],
      }));
      socket.emit("post_comment", {
        postId,
        authorId,
        content,
        comment: newComment.comment,
        actor: user,
        notif: newComment.notif,
      });
      incrementCommentCount(postId);
    } catch (err) {
      console.error("Failed to create a comment", err);
    }
  };

  const clearReplyTo = () => {
    setReplyTo(null);
  };

  const likeComment = async (
    postId,
    commentId,
    userId,
    commentAuthorId,
    content,
  ) => {
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: prev[postId].map((c) =>
        c.id === commentId ? { ...c, likes: [...c.likes, { userId }] } : c,
      ),
    }));

    try {
      // Only get notification id created upon comment like
      const notif = await createLike(postId, commentId);
      socket.emit("like_comment", {
        postId,
        commentId,
        commentAuthorId,
        content,
        actor: user,
        notif,
      });
    } catch {
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: prev[postId].map((c) =>
          c.id === commentId
            ? { ...c, likes: c.likes.filter((l) => l.userId !== userId) }
            : c,
        ),
      }));
    }
  };

  const unlikeComment = async (postId, commentId, userId) => {
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: prev[postId].map((c) =>
        c.id === commentId
          ? { ...c, likes: c.likes.filter((l) => l.userId !== userId) }
          : c,
      ),
    }));

    try {
      await deleteLike(postId, commentId);
      socket.emit("unlike_comment", { postId, commentId, userId });
    } catch {
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: prev[postId].map((c) =>
          c.id === commentId ? { ...c, likes: [...c.likes, { userId }] } : c,
        ),
      }));
    }
  };

  const handleUpdate = async (
    postId,
    commentId,
    { content, mediaUrl, mediaId, mediaType },
  ) => {
    let oldComment;

    const trimmedContent = content.trim();

    setCommentsByPost((prev) => {
      const comments = prev[postId] || [];

      oldComment = comments.find((c) => String(c.id) === String(commentId));

      return {
        ...prev,
        [postId]: comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                content: trimmedContent,
                mediaUrl,
                mediaId,
                mediaType,
              }
            : c,
        ),
      };
    });

    try {
      await updateComment(postId, commentId, {
        content: trimmedContent,
        mediaUrl,
        mediaId,
        mediaType,
      });
    } catch (err) {
      console.error("Failed to update comment", err);

      if (oldComment) {
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: prev[postId].map((c) =>
            c.id === commentId ? oldComment : c,
          ),
        }));
      }
    }
  };

  const handleDelete = async (postId, commentId) => {
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: prev[postId].filter((c) => c.id !== commentId),
    }));
    decrementCommentCount(postId);

    try {
      await deleteComment(postId, commentId);
    } catch (err) {
      console.error("Failed to delete comment", err);
      fetchComments(postId);
    }
  };

  const onOpen = () => {
    setOpenModal(true);
  };
  const onClose = () => {
    setOpenModal(false);
  };

  // POST COMMENT UPDATE LISTENER
  useEffect(() => {
    const onComment = ({ postId, comment }) => {
      setCommentsByPost((prev) => {
        const existing = prev[postId] || [];
        const merged = [...existing, comment];

        const deduped = Array.from(
          new Map(merged.map((c) => [c.id, c])).values(),
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
          ...prev,
          [postId]: deduped,
        };
      });
    };
    socket.on("post_comment_update", onComment);
    return () => socket.off("post_comment_update", onComment);
  }, [incrementCommentCount]);

  // COMMENT REPLY UPDATE LISTENER
  useEffect(() => {
    const onReply = ({ postId, comment }) => {
      setCommentsByPost((prev) => {
        const existing = prev[postId] || [];
        const merged = [...existing, comment];

        const deduped = Array.from(
          new Map(merged.map((c) => [c.id, c])).values(),
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
          ...prev,
          [postId]: deduped,
        };
      });
    };
    socket.on("comment_reply_update", onReply);
    return () => socket.off("comment_reply_update", onReply);
  }, []);

  // COMMENT LIKE COUNT UPDATE LISTENER
  useEffect(() => {
    const update = ({ postId, commentId, userId }) => {
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: prev[postId]?.map((c) =>
          c.id === commentId ? { ...c, likes: [...c.likes, { userId }] } : c,
        ),
      }));
    };
    socket.on("comment_like_count_update", update);
    return () => socket.off("comment_like_count_update", update);
  }, []);

  const value = {
    commentsByPost,
    fetchComments,
    replyTo,
    onReply,
    onCreate,
    clearReplyTo,
    likeComment,
    unlikeComment,
    nextCursor,
    loading,
    hasMore,
    onDeleteComment: handleDelete,
    onUpdateComment: handleUpdate,
    openModal,
    onOpen,
    onClose,
  };
  return (
    <CommentContext.Provider value={value}>{children}</CommentContext.Provider>
  );
}
