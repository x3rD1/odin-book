import styles from "./PostItem.module.css";
import { formatTimeAgo } from "../../utils/time";
import { useNavigate } from "react-router-dom";
import Reaction from "../../components/Reaction";
import MoreAction from "../../components/MoreAction";
import { useContext } from "react";
import AuthContext from "../auth/AuthContext";
import { Media } from "../../components/Media";

function PostItem({
  id,
  content,
  createdAt,
  author,
  mediaUrl,
  mediaId,
  mediaType,
  likes,
  commentCount,
}) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleVisit = (e, userId) => {
    e.stopPropagation();
    navigate(`/users/${userId}`);
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.postHeader}
        onClick={() => navigate(`/posts/${id}`)}
      >
        <div
          className={styles.imgContainer}
          onClick={(e) => handleVisit(e, author.id)}
        >
          <img
            src={
              author.profilePicture ||
              "https://img.icons8.com/nolan/64/user-default.png"
            }
            alt={author.username}
          />
        </div>
        <div className={styles.info}>
          <span
            className={styles.author}
            onClick={(e) => handleVisit(e, author.id)}
          >
            {author.username}
          </span>
          <span className={styles.created}>{formatTimeAgo(createdAt)}</span>
        </div>
        {user.id === author.id && (
          <MoreAction
            postId={id}
            content={content}
            mediaUrl={mediaUrl}
            mediaId={mediaId}
            mediaType={mediaType}
          />
        )}
      </div>

      <div className={styles.content}>{content}</div>

      {mediaUrl && (
        <div className={styles.mediaContainer}>
          <Media url={mediaUrl} type={mediaType} />
        </div>
      )}

      <Reaction
        postId={id}
        likes={likes}
        commentCount={commentCount}
        author={author}
        content={content}
      />
    </div>
  );
}

export default PostItem;
