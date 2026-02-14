import styles from "./MoreAction.module.css";
import MoreBtn from "../assets/icons/more-horizontal.svg?react";
import { useState, useEffect, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import CreatePostModal from "./CreatePostModal";
import PostsContext from "../contexts/PostsContext";

function MoreAction({ postId, content, mediaUrl, mediaId, mediaType }) {
  const { deletePost } = useContext(PostsContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (
        containerRef.current?.contains(event.target) ||
        dropdownRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
    requestAnimationFrame(() => {
      setIsEditing(true);
    });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await deletePost(postId);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={`${styles.button} ${isOpen ? styles.active : ""}`}
        onClick={handleClick}
        aria-label="More actions"
        type="button"
      >
        <MoreBtn className={styles.icon} />
      </button>

      {isOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div
            className={styles.dropdown}
            ref={dropdownRef}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              className={styles.action}
              onClick={handleEdit}
              type="button"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit Post</span>
            </button>

            <button
              className={`${styles.action} ${styles.danger}`}
              onClick={handleDelete}
              disabled={loading}
              type="button"
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
              <span>{loading ? "Deleting..." : "Delete Post"}</span>
            </button>
          </div>
        </>
      )}

      {isEditing &&
        createPortal(
          <CreatePostModal
            postId={postId}
            content={content}
            mediaUrl={mediaUrl}
            mediaId={mediaId}
            mediaType={mediaType}
            closeModal={handleCloseModal}
          />,
          document.body,
        )}
    </div>
  );
}

export default MoreAction;
