import { useContext, useEffect, useRef, useState } from "react";
import MoreBtn from "../../assets/icons/more-horizontal.svg?react";
import styles from "./CommentMoreAction.module.css";
import CommentContext from "../../contexts/CommentContext";
import EditCommentModal from "../../components/EditCommentModal";
import AuthContext from "../auth/AuthContext";

function CommentMoreAction({ postId, postAuthorId, comment, commentAuthor }) {
  const { user } = useContext(AuthContext);
  const { onDeleteComment } = useContext(CommentContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setIsOpen(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await onDeleteComment(postId, comment.id);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isCommentAuthor = commentAuthor === user.id;
  const isPostAuthor = postAuthorId === user.id;

  return (
    <div className={styles.container} ref={containerRef}>
      {(isCommentAuthor || isPostAuthor) && (
        <button
          className={`${styles.button} ${isOpen ? styles.active : ""}`}
          onClick={handleClick}
          aria-label="More actions"
        >
          <MoreBtn className={styles.icon} />
        </button>
      )}

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            <button className={styles.action} onClick={handleEdit}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit comment</span>
            </button>

            <button
              className={`${styles.action} ${styles.danger}`}
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              )}
              <span>{loading ? "Deleting..." : "Delete comment"}</span>
            </button>
          </div>
        </>
      )}

      {isEditing && (
        <EditCommentModal
          postId={postId}
          commentId={comment.id}
          closeModal={() => setIsEditing(false)}
          comment={comment}
        />
      )}
    </div>
  );
}

export default CommentMoreAction;
