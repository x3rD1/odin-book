import { useNavigate, useParams } from "react-router-dom";
import styles from "./PostDetail.module.css";
import BackIcon from "../../assets/icons/arrow-left.svg?react";
import { useContext, useEffect, useRef, useState } from "react";
import { formatTimeAgo } from "../../utils/time";
import Comments from "../comments/Comments";
import Reaction from "../../components/Reaction";
import PostsContext from "../../contexts/PostsContext";
import CommentContext from "../../contexts/CommentContext";
import { socket } from "../../utils/socket.js";
import { Media } from "../../components/Media.jsx";

function PostDetail() {
  const { id: postId } = useParams();
  const { posts, fetchPosts } = useContext(PostsContext);
  const { fetchComments } = useContext(CommentContext);
  const post = posts.find((post) => String(post.id) === postId);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const handleFocus = () => {
    if (isFocused) {
      inputRef.current?.blur();
    } else {
      inputRef.current?.focus();
    }
    setIsFocused(!isFocused);
  };

  const handleVisit = (e, userId) => {
    e.stopPropagation();
    navigate(`/users/${userId}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop = 0;
    }
  }, [postId]);

  useEffect(() => {
    if (!post) return;

    socket.emit("join_post", post.id);
    return () => socket.emit("leave_post", post.id);
  }, [post]);

  useEffect(() => {
    if (!post) {
      fetchPosts();
    }
  }, [post, fetchPosts]);

  useEffect(() => {
    if (!postId) return;

    fetchComments(postId, null, { force: true });
  }, [postId, fetchComments]);

  if (!post) return null;

  return (
    <div className={styles.postDetailWrapper} ref={wrapperRef}>
      <div className={styles.goBack}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <span className={styles.headerTitle}>Post</span>
      </div>
      <div className={styles.container}>
        <div className={styles.postHeader}>
          <div
            className={styles.imgContainer}
            onClick={(e) => handleVisit(e, post.author.id)}
          >
            <img
              src={
                post.author.profilePicture ||
                "https://img.icons8.com/nolan/64/user-default.png"
              }
              alt={post.author.username}
            />
          </div>
          <div className={styles.info}>
            <span
              className={styles.author}
              onClick={(e) => handleVisit(e, post.author.id)}
            >
              {post.author.username}
            </span>
            <span className={styles.created}>
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
        </div>

        <div className={styles.content}>{post.content}</div>

        {post.mediaUrl && (
          <div className={styles.mediaContainer}>
            <Media url={post.mediaUrl} type={post.mediaType} />
          </div>
        )}

        <Reaction
          postId={post.id}
          likes={post.likes}
          commentCount={post.commentCount}
          author={post.author}
          content={post.content}
          handleFocus={handleFocus}
        />
      </div>
      <Comments
        postId={postId}
        author={post.author}
        handleFocus={handleFocus}
        ref={inputRef}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
      />
    </div>
  );
}

export default PostDetail;
