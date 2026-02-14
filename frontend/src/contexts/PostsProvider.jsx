import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";
import {
  createLike,
  createPost,
  deleteLike,
  deletePost,
  getAllPosts,
  updatePost,
} from "../features/posts/posts.api";
import PostsContext from "./PostsContext";
import AuthContext from "../features/auth/AuthContext";

export function PostsProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const isFetching = useRef(false);

  const fetchPosts = async () => {
    if (isFetching.current || !hasMore) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const url = cursor ? `/posts/?cursor=${cursor}` : `/posts/`;
      const res = await getAllPosts(url);

      setPosts((prev) => [...prev, ...res.posts]);
      setCursor(res.nextCursor);
      setHasMore(Boolean(res.nextCursor));
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setHasMore(false);
      throw err;
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  const handleToggleLike = async (postId, userId) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const alreadyLiked = targetPost.likes.some((l) => l.userId === userId);

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        return {
          ...post,
          likes: alreadyLiked
            ? post.likes.filter((like) => like.userId !== userId)
            : [...post.likes, { userId }],
        };
      }),
    );

    let notif = null;
    try {
      if (alreadyLiked) {
        await deleteLike(postId);
      } else {
        const res = await createLike(postId);
        notif = res ?? null;
      }
    } catch (err) {
      console.error("Like failed, rolling back", err);

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            likes: alreadyLiked
              ? [...post.likes, { userId }]
              : post.likes.filter((l) => l.userId !== userId),
          };
        }),
      );
    }

    return { like: !alreadyLiked, notif };
  };

  const handleCreatePost = async ({
    content,
    mediaUrl,
    mediaId,
    mediaType,
  }) => {
    try {
      const newPost = await createPost({
        content,
        mediaUrl,
        mediaId,
        mediaType,
      });
      setPosts((prev) => [newPost, ...prev]);
      socket.emit("create_post", { newPost });
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  const handleEditPost = async (
    postId,
    { newContent, mediaUrl, mediaId, mediaType },
  ) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              content: newContent,
              mediaUrl,
              mediaId,
              mediaType,
            }
          : post,
      ),
    );

    try {
      await updatePost(postId, {
        content: newContent,
        mediaUrl,
        mediaId,
        mediaType,
      });
    } catch (err) {
      console.error("Failed to update post", err);
    }
  };

  const handleDeletePost = async (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));

    try {
      await deletePost(postId);
    } catch (err) {
      console.error("Delete failed, rolling back", err);
    }
  };

  // Posts comments relate
  const incrementCommentCount = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        String(post.id) === postId
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post,
      ),
    );
  }, []);

  const decrementCommentCount = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        String(post.id) === postId
          ? { ...post, commentCount: (post.commentCount || 0) - 1 }
          : post,
      ),
    );
  }, []);

  // POST LIST UPDATE
  useEffect(() => {
    const handler = ({ newPost }) => {
      setPosts((prev) => [newPost, ...prev]);
    };
    socket.on("post_update", handler);
    return () => socket.off("post_update", handler);
  }, []);
  // POST LIKE COUNT LISTENER
  useEffect(() => {
    if (!user) return;

    const onLiked = ({ postId, from }) => {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;

          if (post.likes.some((l) => l.userId === from)) return post;

          return {
            ...post,
            likes: [...post.likes, { userId: from }],
          };
        }),
      );
    };
    socket.on("post_liked_update_count", onLiked); // Eto yung nag trigger
    return () => socket.off("post_liked_update_count", onLiked);
  }, [user]);
  // POST UNLIKE COUNT LISTENER
  useEffect(() => {
    if (!user) return;

    const onUnliked = ({ postId, from }) => {
      // Prevents duplicate unlike for the current user
      if (from === user.id) return;

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            likes: post.likes.filter((l) => l.userId !== from),
          };
        }),
      );
    };
    socket.on("post_unliked_update_count", onUnliked);
    return () => socket.off("post_unliked_update_count", onUnliked);
  }, [user]);

  // POST COMMENT COUNT UPDATE LISTENER
  useEffect(() => {
    const updateCount = ({ postId }) => {
      incrementCommentCount(postId);
    };
    socket.on("post_comment_count_update", updateCount);
    return () => socket.off("post_comment_count_update", updateCount);
  }, [incrementCommentCount]);

  const value = {
    posts,
    fetchPosts,
    hasMore,
    loading,
    toggleLike: handleToggleLike,
    createPost: handleCreatePost,
    editPost: handleEditPost,
    deletePost: handleDeletePost,
    incrementCommentCount,
    decrementCommentCount,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}
