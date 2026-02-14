import styles from "./EditCommentModal.module.css";
import CloseIcon from "../assets/icons/x.svg?react";
import ImageIcon from "../assets/icons/image.svg?react";
import { useContext, useState, useRef } from "react";
import { createPortal } from "react-dom";
import CommentContext from "../contexts/CommentContext";
import { Media } from "./Media";
import GifPicker from "./GifPicker";
import { useLockBodyScroll } from "../utils/useLockBodyScroll";

function EditCommentModal({
  postId,
  commentId,
  closeModal,
  comment: {
    content,
    mediaUrl: initialMediaUrl,
    mediaId: initialMediaId,
    mediaType: initialMediaType,
  },
}) {
  useLockBodyScroll(true);
  const { onUpdateComment } = useContext(CommentContext);
  const [text, setText] = useState(content || "");
  const [file, setFile] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl);
  const [mediaId, setMediaId] = useState(initialMediaId);
  const [mediaType, setMediaType] = useState(initialMediaType);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const maxChars = 280;

  const handleSave = async () => {
    if ((!text.trim() && !file && !mediaUrl && !gifUrl) || isLoading) return;

    setIsLoading(true);

    try {
      let finalMediaUrl = mediaUrl;
      let finalMediaId = mediaId;
      let finalMediaType = mediaType;

      if (gifUrl) {
        finalMediaUrl = gifUrl;
        finalMediaId = null;
        finalMediaType = "image";
      } else if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/upload/media`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          },
        );

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        finalMediaUrl = data.url;
        finalMediaId = data.public_id;
        finalMediaType = data.resource_type;
      }

      onUpdateComment(postId, commentId, {
        content: text,
        mediaUrl: finalMediaUrl,
        mediaId: finalMediaId,
        mediaType: finalMediaType,
      });

      closeModal();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setGifUrl(null);
      setMediaUrl(null);
      setMediaType(null);
      setFile(selectedFile);
    }
    e.target.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeMedia = () => {
    setFile(null);
    setGifUrl(null);
    setMediaUrl(null);
    setMediaId(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGifSelect = (url) => {
    setFile(null);
    setMediaUrl(null);
    setMediaType(null);
    setGifUrl(url);
    setShowGifPicker(false);
  };

  const displayUrl = gifUrl || (file ? URL.createObjectURL(file) : mediaUrl);

  return (
    <>
      <div
        className={styles.overlay}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <button className={styles.closeBtn} onClick={closeModal}>
              <CloseIcon />
            </button>
            <span className={styles.title}>Edit Comment</span>
            <div className={styles.spacer} />
          </div>

          <div className={styles.content}>
            <textarea
              ref={(el) => {
                if (el) el.focus();
              }}
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Edit your comment..."
              maxLength={maxChars}
            />

            {displayUrl && (
              <div className={styles.mediaPreview}>
                <button
                  className={styles.removeMediaBtn}
                  onClick={removeMedia}
                  title="Remove media"
                >
                  <CloseIcon />
                </button>
                {gifUrl ||
                mediaType === "image" ||
                (file && file.type.startsWith("image")) ? (
                  <img src={displayUrl} alt="Comment media" />
                ) : (
                  <video src={displayUrl} controls />
                )}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.actions}>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className={styles.hiddenInput}
              />
              <button
                className={styles.iconBtn}
                onClick={triggerFileInput}
                title="Add photo/video"
                type="button"
              >
                <ImageIcon />
              </button>
              <button
                className={styles.gifBtn}
                onClick={() => setShowGifPicker(true)}
                type="button"
              >
                GIF
              </button>
            </div>

            <div className={styles.rightSection}>
              <span className={styles.charCount}>
                {text.length}/{maxChars}
              </span>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={(!text.trim() && !displayUrl) || isLoading}
                type="button"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showGifPicker &&
        createPortal(
          <GifPicker
            onSelect={handleGifSelect}
            onClose={() => setShowGifPicker(false)}
          />,
          document.body,
        )}
    </>
  );
}

export default EditCommentModal;
