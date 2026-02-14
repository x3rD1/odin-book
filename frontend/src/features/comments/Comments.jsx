import { useContext, useEffect, useRef } from "react";
import styles from "./Comments.module.css";
import CommentItem from "./CommentItem";
import InputComment from "./InputComment";
import CommentContext from "../../contexts/CommentContext";
import { useSearchParams } from "react-router-dom";

function Comments({
  postId,
  author,
  ref,
  isFocused,
  setIsFocused,
  handleFocus,
}) {
  const { commentsByPost, fetchComments, nextCursor, loading, hasMore } =
    useContext(CommentContext);
  const [searchParams] = useSearchParams();
  const focusCommentId = searchParams.get("comment");
  const commentRefs = useRef({});

  useEffect(() => {
    if (!commentsByPost[postId]) {
      fetchComments(postId);
    }
  }, [postId, commentsByPost, fetchComments]);

  const comments = commentsByPost[postId] || [];
  const commentsLength = comments.length;

  useEffect(() => {
    if (!focusCommentId) return;

    const el = commentRefs.current[focusCommentId];
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    el.classList.add(styles.highlight);

    const timer = setTimeout(() => {
      el.classList.remove(styles.highlight);
    }, 1500);

    return () => clearTimeout(timer);
  }, [focusCommentId, commentsLength]);

  // Infinite scroll observer
  const loaderRef = useRef(null);

  useEffect(() => {
    const handleFetchMore = async () => {
      if (loading[postId] || !hasMore[postId]) return;
      await fetchComments(postId, nextCursor[postId]);
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
  }, [fetchComments, loading, hasMore, postId, nextCursor]);

  const topLevelComments = (commentsByPost[postId] || []).filter(
    (c) => c.parentId === null,
  );

  if (!commentsByPost[postId]) return null;

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {topLevelComments.length === 0 ? (
          <div className={styles.empty}>
            <svg
              className={styles.emptyIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <h3>No comments yet</h3>
            <p>Be the first to share your thoughts.</p>
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              postAuthorId={author.id}
              handleFocus={handleFocus}
              focusCommentId={focusCommentId}
              ref={(el) => {
                if (el) commentRefs.current[String(comment.id)] = el;
              }}
            />
          ))
        )}
      </div>

      {hasMore[postId] && (
        <div ref={loaderRef} className={styles.loader}>
          {loading[postId] && <div className={styles.spinner} />}
        </div>
      )}

      <div className={styles.inputContainer}>
        <InputComment
          postId={postId}
          author={author}
          ref={ref}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
        />
      </div>
    </div>
  );
}

export default Comments;
