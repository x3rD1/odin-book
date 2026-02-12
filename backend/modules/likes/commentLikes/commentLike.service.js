const prisma = require("../../../lib/prisma");
const notifService = require("../../notifications/notif.service");

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

exports.createLike = async (commentId, user) => {
  // Check if comment exists
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, content: true, postId: true },
  });
  // Throw error
  if (!existingComment) throw new Error("COMMENT_NOT_FOUND");

  try {
    await prisma.commentLike.create({ data: { userId: user.id, commentId } });

    let notif = null;

    if (existingComment.userId !== user.id) {
      notif = await notifService.createNotif({
        type: "LIKE",
        actorId: user.id,
        receiverId: existingComment.userId,
        postId: existingComment.postId,
        commentId,
        message: `${user.username} liked your comment: "${existingComment.content}"`,
      });
    }
    return notif;
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
    select: { id: true, userId: true, postId: true },
  });
  // Throw error
  if (!existingComment) throw new Error("COMMENT_NOT_FOUND");

  try {
    await prisma.commentLike.delete({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existingComment.userId !== userId) {
      await notifService.removeNotif({
        type: "LIKE",
        actorId: userId,
        receiverId: existingComment.userId,
        postId: existingComment.postId,
        commentId,
      });
    }
  } catch (err) {
    if (err.code === "P2025") {
      throw new Error("LIKE_NOT_FOUND");
    }
    throw err;
  }
};
