import styles from "./CommentItem.module.css";
import { forwardRef, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import ViewMore from "./ViewMore";
import CommentReaction from "../../components/CommentReaction";
import CommentContext from "../../contexts/CommentContext";
import CommentMoreAction from "./CommentMoreAction";
import { Media } from "../../components/Media";

const CommentItem = forwardRef(function CommentItem(
  { postId, postAuthorId, handleFocus, comment },
  ref,
) {
  const { commentsByPost, onReply } = useContext(CommentContext);
  const navigate = useNavigate();
  const [isViewed, setIsViewed] = useState(false);

  const replies = (commentsByPost[postId] || []).filter(
    (c) => c.parentId === comment.id,
  );
  const replyCount = replies.length;

  const handleView = () => {
    setIsViewed(true);
  };

  const handleVisitUser = (e, userId) => {
    e.stopPropagation();
    navigate(`/users/${userId}`);
  };

  return (
    <div className={styles.container} ref={ref} id={`comment-${comment.id}`}>
      <div
        className={styles.imgContainer}
        onClick={(e) => handleVisitUser(e, comment.user.id)}
      >
        <img
          src={
            comment.user.profilePicture ||
            "https://api.dicebear.com/9.x/avataaars/svg?seed=default"
          }
          alt={comment.user.username}
        />
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.content}>
          <div className={styles.header}>
            <span
              className={styles.username}
              onClick={(e) => handleVisitUser(e, comment.user.id)}
            >
              {comment.user.username}
            </span>
            <CommentMoreAction
              postId={postId}
              postAuthorId={postAuthorId}
              comment={comment}
              commentAuthor={comment.user.id}
            />
          </div>

          <p className={styles.text}>{comment.content}</p>

          {comment.mediaUrl && (
            <div className={styles.mediaContainer}>
              <Media url={comment.mediaUrl} type={comment.mediaType} />
            </div>
          )}
        </div>

        <CommentReaction
          id={comment.id}
          postId={postId}
          commentAuthorId={comment.user.id}
          content={comment.content}
          likes={comment.likes}
          createdAt={comment.createdAt}
          handleFocus={() => {
            onReply(postId, comment.id, comment.user.username, comment.user.id);
            handleFocus();
          }}
        />

        <div className={styles.viewMore}>
          {!isViewed && replyCount > 0 && (
            <span onClick={handleView}>
              {replyCount === 1 ? "View 1 reply" : `View ${replyCount} replies`}
            </span>
          )}

          {isViewed && (
            <div className={styles.repliesList}>
              <ViewMore
                replies={replies}
                postId={postId}
                handleFocus={handleFocus}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CommentItem;
