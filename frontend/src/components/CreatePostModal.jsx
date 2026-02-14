import styles from "./CreatePostModal.module.css";
import CloseIcon from "../assets/icons/x.svg?react";
import ImageIcon from "../assets/icons/image.svg?react";
import { useContext, useState, useRef, useEffect } from "react";
import AuthContext from "../features/auth/AuthContext";
import PostsContext from "../contexts/PostsContext";
import GifPicker from "./GifPicker";
import { useLockBodyScroll } from "../utils/useLockBodyScroll";

function CreatePostModal({
  postId,
  content,
  mediaUrl: initialMediaUrl,
  mediaId: initialMediaId,
  mediaType: initialMediaType,
  closeModal,
}) {
  useLockBodyScroll(true);
  const { user } = useContext(AuthContext);
  const { editPost, createPost } = useContext(PostsContext);
  const [file, setFile] = useState(null);
  const [text, setText] = useState(content || "");
  const [gifUrl, setGifUrl] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingMediaUrl, setExistingMediaUrl] = useState(
    initialMediaUrl || null,
  );
  const [existingMediaId, setExistingMediaId] = useState(
    initialMediaId || null,
  );
  const [existingMediaType, setExistingMediaType] = useState(
    initialMediaType || null,
  );
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const isEditing = Boolean(postId);

  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePost = async () => {
    if ((!text.trim() && !file && !gifUrl) || isLoading) return;

    setIsLoading(true);

    try {
      let finalMediaUrl = existingMediaUrl;
      let finalMediaId = existingMediaId;
      let finalMediaType = existingMediaType;

      if (file) {
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

        if (!res.ok) throw new Error("Media upload failed");

        const data = await res.json();
        finalMediaUrl = data.url;
        finalMediaId = data.public_id;
        finalMediaType = data.resource_type;
      }

      if (gifUrl) {
        finalMediaUrl = gifUrl;
        finalMediaId = null;
        finalMediaType = "image";
      }

      if (isEditing) {
        await editPost(postId, {
          newContent: text,
          mediaUrl: finalMediaUrl,
          mediaId: finalMediaId,
          mediaType: finalMediaType,
        });
      } else {
        await createPost({
          content: text,
          mediaUrl: finalMediaUrl,
          mediaId: finalMediaId,
          mediaType: finalMediaType,
        });
      }

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
    setExistingMediaUrl(null);
    setExistingMediaId(null);
    setExistingMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        e.stopPropagation();
        closeModal();
      }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={closeModal}>
            <CloseIcon />
          </button>
          <span className={styles.title}>
            {isEditing ? "Edit Post" : "Create Post"}
          </span>
          <div className={styles.spacer} />
        </div>

        <div className={styles.content}>
          <div className={styles.user}>
            <img
              src={
                user.profilePicture ||
                "https://api.dicebear.com/9.x/avataaars/svg?seed=default"
              }
              alt={user.username}
            />
            <span>@{user.username}</span>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isEditing ? "Edit your post..." : "What's on your mind?"
            }
          />

          {gifUrl && (
            <div className={styles.mediaPreview}>
              <button
                className={styles.removeMediaBtn}
                onClick={removeMedia}
                title="Remove GIF"
              >
                <CloseIcon />
              </button>
              <img src={gifUrl} alt="Selected GIF" />
            </div>
          )}

          {existingMediaUrl && !file && !gifUrl && (
            <div className={styles.mediaPreview}>
              <button
                className={styles.removeMediaBtn}
                onClick={() => {
                  setExistingMediaUrl(null);
                  setExistingMediaId(null);
                  setExistingMediaType(null);
                }}
              >
                <CloseIcon />
              </button>

              {existingMediaType === "video" ? (
                <video src={existingMediaUrl} controls />
              ) : (
                <img src={existingMediaUrl} alt="Existing media" />
              )}
            </div>
          )}

          {file && (
            <div className={styles.mediaPreview}>
              <button
                className={styles.removeMediaBtn}
                onClick={removeMedia}
                title="Remove file"
              >
                <CloseIcon />
              </button>
              {file.type.startsWith("image") ? (
                <img src={URL.createObjectURL(file)} alt="Selected file" />
              ) : (
                <video src={URL.createObjectURL(file)} controls />
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
              style={{ display: "none" }}
            />
            <button
              className={styles.iconBtn}
              onClick={triggerFileInput}
              title="Add photo/video"
            >
              <ImageIcon />
            </button>
            <button
              className={styles.gifBtn}
              onClick={() => setShowGifPicker(true)}
            >
              GIF
            </button>
          </div>

          <div className={styles.rightSection}>
            <span className={styles.charCount}>{text.length}/280</span>
            <button
              onClick={handlePost}
              disabled={(!text.trim() && !file && !gifUrl) || isLoading}
              className={styles.postBtn}
            >
              {isLoading ? "Posting..." : isEditing ? "Save" : "Post"}
            </button>
          </div>
        </div>

        {showGifPicker && (
          <div className={styles.gifPickerWrapper}>
            <GifPicker
              onSelect={(url) => {
                setGifUrl(url);
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                setShowGifPicker(false);
              }}
              onClose={() => setShowGifPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatePostModal;
