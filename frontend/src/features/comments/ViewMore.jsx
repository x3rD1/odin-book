import CommentItem from "./CommentItem";

function ViewMore({ replies, postId, handleFocus }) {
  return (
    <div>
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          handleFocus={handleFocus}
        />
      ))}
    </div>
  );
}

export default ViewMore;
