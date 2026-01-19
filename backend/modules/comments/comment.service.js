const prisma = require("../../lib/prisma");

exports.getAllComments = async (postId, cursorId) => {
  // Check then get if post exists
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      likes: { select: { userId: true } },
      user: { select: { id: true, username: true, profilePicture: true } },
    },
    take: 10,
    cursor: cursorId ? { id: cursorId } : undefined,
    skip: cursorId ? 1 : 0,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const nextCursor = comments.length ? comments[comments.length - 1].id : null;

  return { comments, nextCursor };
};

exports.getComment = async (postId, commentId) => {
  // Check then get if comment exists and belongs to postId
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId },
    include: {
      user: { select: { id: true, username: true, profilePicture: true } },
    },
  });

  if (!comment) throw new Error("COMMENT_NOT_FOUND");

  return comment;
};

exports.getReplies = async (postId, commentId, cursorId) => {
  try {
    // Check then get if comment exists and belongs to postId
    const replies = await prisma.comment.findMany({
      where: { postId, parentId: commentId },
      include: {
        user: { select: { id: true, username: true, profilePicture: true } },
      },
      take: 5,
      cursor: cursorId ? { id: cursorId } : undefined,
      skip: cursorId ? 1 : 0,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const nextCursor = replies.length ? replies[replies.length - 1].id : null;

    return { replies, nextCursor };
  } catch (err) {
    if (err.code === "P2003" && err.meta?.field_name.include("Post")) {
      throw new Error("POST_NOT_FOUND");
    } else {
      throw new Error("COMMENT_NOT_FOUND");
    }
  }
};

exports.createComment = async (postId, userId, content) => {
  try {
    // Check then create if posts exists
    const comment = await prisma.comment.create({
      data: { content, userId, postId },
    });

    return comment;
  } catch (err) {
    if (err.code === "P2003") throw new Error("POST_NOT_FOUND");
    throw err;
  }
};

exports.createReply = async (postId, commentId, userId, content) => {
  try {
    const reply = await prisma.comment.create({
      data: { content, userId, postId, parentId: commentId },
    });

    return reply;
  } catch (err) {
    if (err.code === "P2003" && err.meta?.field_name.include("Post")) {
      throw new Error("POST_NOT_FOUND");
    } else {
      throw new Error("COMMENT_NOT_FOUND");
    }
  }
};

exports.updateComment = async (postId, commentId, userId, content) => {
  const updatedComment = await prisma.comment.updateMany({
    where: { id: commentId, userId, postId },
    data: { content },
  });

  if (updatedComment.count === 0) throw new Error("COMMENT_NOT_FOUND");
  return updatedComment;
};

exports.deleteComment = async (postId, commentId, userId) => {
  const deletedComment = await prisma.comment.deleteMany({
    where: { id: commentId, userId, postId },
  });

  if (deletedComment.count === 0) throw new Error("COMMENT_NOT_FOUND");

  return deletedComment;
};
