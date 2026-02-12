const prisma = require("../../../lib/prisma");
const notifService = require("../../notifications/notif.service");

exports.getAllLikes = async (postId) => {
  // Check if post exists
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  // Throw error
  if (!existingPost) throw new Error("POST_NOT_FOUND");
  // Get all likes rows of postId
  const likes = await prisma.postLike.findMany({
    where: { postId },
    include: {
      user: { select: { id: true, username: true, profilePicture: true } },
    },
  });

  return likes;
};

exports.createLike = async (postId, user) => {
  // Check if post exists
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
      content: true,
    },
  });
  // Throw error
  if (!existingPost) throw new Error("POST_NOT_FOUND");

  try {
    await prisma.postLike.create({
      data: { postId, userId: user.id },
    });

    let notif = null;

    if (existingPost.authorId !== user.id) {
      notif = await notifService.createNotif({
        type: "LIKE",
        actorId: user.id,
        receiverId: existingPost.authorId,
        postId,
        message: `${user.username} liked your post: "${existingPost.content}"`,
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

exports.deleteLike = async (postId, userId) => {
  // Check if post exists
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });
  // Throw error
  if (!existingPost) throw new Error("POST_NOT_FOUND");

  try {
    await prisma.postLike.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
    if (existingPost.authorId !== userId) {
      await notifService.removeNotif({
        type: "LIKE",
        actorId: userId,
        receiverId: existingPost.authorId,
        postId,
      });
    }
  } catch (err) {
    if (err.code === "P2025") {
      throw new Error("LIKE_NOT_FOUND");
    }
    throw err;
  }
};
