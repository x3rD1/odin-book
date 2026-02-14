import styles from "./InputComment.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CommentContext from "../../contexts/CommentContext";
import GifPicker from "../../components/GifPicker";
import ImageIcon from "../../assets/icons/image.svg?react";

function InputComment({ postId, author, ref, isFocused, setIsFocused }) {
  const { replyTo, onCreate, clearReplyTo } = useContext(CommentContext);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isFocused) return;

    const handlePointerDown = (e) => {
      if (containerRef.current?.contains(e.target)) return;
      if (showGifPicker) return;
      clearReplyTo();
      setIsFocused(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isFocused, setIsFocused, clearReplyTo, showGifPicker]);

  const handleSend = async () => {
    if (!comment.trim() && !file && !gifUrl) return;

    let mediaUrl = null;
    let mediaId = null;
    let mediaType = null;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload/media`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Media upload failed");

      const data = await res.json();
      mediaUrl = data.url;
      mediaId = data.public_id;
      mediaType = data.resource_type;
    }

    if (gifUrl) {
      mediaUrl = gifUrl;
      mediaId = null;
      mediaType = "image";
    }

    onCreate({
      postId,
      content: comment,
      authorId: author.id,
      mediaUrl,
      mediaId,
      mediaType,
    });

    setComment("");
    setFile(null);
    setGifUrl(null);
    clearReplyTo();
    setIsFocused(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setGifUrl(null);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGifSelect = (url) => {
    setGifUrl(url);
    setFile(null);
    setShowGifPicker(false);
  };

  const handleGifClose = () => {
    setShowGifPicker(false);
  };

  return (
    <>
      <div className={styles.inputWrapper} ref={containerRef}>
        <div className={styles.inputContainer}>
          <input
            ref={ref}
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={
              replyTo
                ? `Replying to @${replyTo.username}`
                : "Write a comment..."
            }
            className={styles.textInput}
          />

          {(gifUrl || file) && (
            <div className={styles.mediaPreview}>
              <button className={styles.removeMediaBtn} onClick={removeMedia}>
                ×
              </button>
              {gifUrl ? (
                <img src={gifUrl} alt="Selected GIF" />
              ) : file.type.startsWith("image") ? (
                <img src={URL.createObjectURL(file)} alt="Selected file" />
              ) : (
                <video src={URL.createObjectURL(file)} controls />
              )}
            </div>
          )}

          {isFocused && (
            <div className={styles.actionBar}>
              <div className={styles.leftActions}>
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

              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!comment.trim() && !file && !gifUrl}
                type="button"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>

      {showGifPicker &&
        createPortal(
          <GifPicker onSelect={handleGifSelect} onClose={handleGifClose} />,
          document.body,
        )}
    </>
  );
}

export default InputComment;
