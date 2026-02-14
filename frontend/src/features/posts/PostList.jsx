import styles from "./PostList.module.css";
import PostItem from "./PostItem";
import PostSkeleton from "./PostSkeleton";
import { useContext, useEffect, useRef, useState } from "react";
import PostsContext from "../../contexts/PostsContext";

function PostList() {
  const { posts, fetchPosts, hasMore, loading } = useContext(PostsContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (posts.length === 0) {
      const loadPosts = async () => {
        try {
          await fetchPosts();
        } catch (err) {
          console.error(err);
          setError("Failed to load posts. Please try again.");
        }
      };

      loadPosts();
    }
  }, [fetchPosts, posts.length]);

  // Infinite scroll observer
  const loaderRef = useRef(null);

  useEffect(() => {
    const handleFetchMore = async () => {
      if (loading || !hasMore) return;

      try {
        await fetchPosts();
      } catch (err) {
        console.error(err);
        setError("Failed to load more posts.");
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          handleFetchMore();
        }
      },
      { threshold: 1.0 },
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [fetchPosts, loading, hasMore]);

  if (loading && posts.length === 0) {
    return <PostSkeleton />;
  }

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.error}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!loading && posts.length === 0 && !error && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h3>No posts yet</h3>
          <p>
            Be the first to share something or follow others to see their posts
            here.
          </p>
        </div>
      )}

      <div className={styles.list}>
        {posts.map((post) => (
          <PostItem
            key={post.id}
            id={post.id}
            content={post.content}
            createdAt={post.createdAt}
            author={post.author}
            likes={post.likes}
            mediaUrl={post.mediaUrl}
            mediaId={post.mediaId}
            mediaType={post.mediaType}
            commentCount={post.commentCount}
          />
        ))}
      </div>

      {hasMore && posts.length > 0 && (
        <div ref={loaderRef} className={styles.loader}>
          {loading && <div className={styles.spinner} />}
        </div>
      )}
    </div>
  );
}

export default PostList;
