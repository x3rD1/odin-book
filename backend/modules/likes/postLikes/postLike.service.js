const prisma = require("../../../lib/prisma");

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

exports.createLike = async (postId, userId) => {
  // Check if post exists
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  // Throw error
  if (!existingPost) throw new Error("POST_NOT_FOUND");

  try {
    return await prisma.postLike.create({
      data: { postId, userId },
    });
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
    select: { id: true },
  });
  // Throw error
  if (!existingPost) throw new Error("POST_NOT_FOUND");

  try {
    return await prisma.postLike.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
  } catch (err) {
    if (err.code === "P2025") {
      throw new Error("LIKE_NOT_FOUND");
    }
    throw err;
  }
};
