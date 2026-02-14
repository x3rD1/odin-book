import styles from "../features/posts/PostItem.module.css";
import LikeIcon from "../assets/icons/thumbs-up.svg?react";
import CommentIcon from "../assets/icons/message-circle.svg?react";
import AuthContext from "../features/auth/AuthContext";
import { useContext } from "react";
import { socket } from "../utils/socket";
import PostsContext from "../contexts/PostsContext";

function Reaction({
  postId,
  likes,
  commentCount,
  author,
  handleFocus,
  content,
}) {
  const { user } = useContext(AuthContext);
  const { toggleLike } = useContext(PostsContext);
  const isLiked = likes.some((l) => l.userId === user.id);
  const likeCount = likes.length;

  const OnToggleLike = async () => {
    const { like, notif } = await toggleLike(postId, user.id);

    if (like) {
      socket.emit("like_post", {
        postId,
        authorId: author.id,
        actor: user,
        content,
        notif,
      });
    } else {
      socket.emit("unlike_post", { postId });
    }
  };

  return (
    <div className={styles.reactions}>
      <div
        className={`${styles.iconContainer} ${styles.like}`}
        onClick={OnToggleLike}
      >
        <LikeIcon className={`${styles.icon} ${isLiked && styles.liked}`} />
        <span className={styles.count}>{likeCount}</span>
      </div>
      <div
        className={`${styles.iconContainer} ${styles.comment}`}
        onClick={handleFocus}
      >
        <CommentIcon className={styles.icon} />
        <span className={styles.count}>{commentCount}</span>
      </div>
    </div>
  );
}

export default Reaction;
