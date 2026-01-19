const prisma = require("../../../lib/prisma");

exports.getAllLikes = async (commentId) => {
  // Check if comment exists
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });
  // Throw error
  if (!existingComment) throw new Error("COMMENT_NOT_FOUND");

  const likes = await prisma.commentLike.findMany({
    where: { commentId },
    include: {
      user: { select: { id: true, username: true, profilePicture: true } },
    },
  });

  return likes;
};

exports.createLike = async (commentId, userId) => {
  // Check if comment exists
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });
  // Throw error
  if (!existingComment) throw new Error("COMMENT_NOT_FOUND");

  try {
    return await prisma.commentLike.create({ data: { userId, commentId } });
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("LIKE_ALREADY_EXISTS");
    }
    throw err;
  }
};

exports.deleteLike = async (commentId, userId) => {
  // Check if comment exists
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });
  // Throw error
  if (!existingComment) throw new Error("COMMENT_NOT_FOUND");

  try {
    return await prisma.commentLike.delete({
      where: { userId_commentId: { userId, commentId } },
    });
  } catch (err) {
    if (err.code === "P2025") {
      throw new Error("LIKE_NOT_FOUND");
    }
    throw err;
  }
};
