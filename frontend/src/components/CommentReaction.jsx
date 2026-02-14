import styles from "./CommentReaction.module.css";
import AuthContext from "../features/auth/AuthContext";
import { formatTimeAgo } from "../utils/time";
import { useContext } from "react";
import CommentContext from "../contexts/CommentContext";

function CommentReaction({
  id,
  postId,
  commentAuthorId,
  content,
  likes,
  createdAt,
  handleFocus,
}) {
  const { user } = useContext(AuthContext);
  const { likeComment, unlikeComment } = useContext(CommentContext);
  const isLiked = likes.some((l) => l.userId === user.id);
  const likeCount = likes.length;

  const toggleLike = () => {
    if (isLiked) {
      unlikeComment(postId, id, user.id);
    } else {
      likeComment(postId, id, user.id, commentAuthorId, content);
    }
  };

  const onClickReply = () => {
    handleFocus();
  };

  return (
    <div className={styles.actions}>
      <span className={styles.timestamp}>{formatTimeAgo(createdAt)}</span>

      <button
        className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
        onClick={toggleLike}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>Like</span>
      </button>

      <span className={styles.count}>{likeCount > 0 && likeCount}</span>

      <button className={styles.actionBtn} onClick={onClickReply}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Reply</span>
      </button>
    </div>
  );
}

export default CommentReaction;
