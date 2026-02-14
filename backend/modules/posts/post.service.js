const prisma = require("../../lib/prisma");
const cloudinary = require("../../lib/cloudinary");

exports.getAllPosts = async (userId, cursorId) => {
  // Get posts from user and following
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { authorId: userId },
        { author: { follower: { some: { followerId: userId } } } },
      ],
    },
    include: {
      author: { select: { id: true, username: true, profilePicture: true } },
      likes: {
        select: { userId: true },
      },
      comments: {
        select: { userId: true },
      },
    },
    take: 10,
    cursor: cursorId ? { id: cursorId } : undefined,
    skip: cursorId ? 1 : 0,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const nextCursor = posts.length ? posts[posts.length - 1].id : null;

  return { posts, nextCursor };
};

exports.getPost = async (postId) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, username: true, profilePicture: true } },
      likes: { select: { userId: true } },
      comments: { select: { id: true } },
    },
  });

  if (!post) throw new Error("POST_NOT_FOUND");

  return post;
};

exports.createPost = async ({
  content,
  mediaUrl,
  mediaId,
  mediaType,
  userId,
}) => {
  return prisma.post.create({
    data: {
      content,
      mediaUrl,
      mediaId,
      mediaType,
      authorId: userId,
    },
    include: {
      author: true,
      likes: true,
      comments: true,
    },
  });
};

exports.updatePost = async ({
  postId,
  newContent,
  mediaUrl,
  mediaId,
  mediaType,
  userId,
}) => {
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost || existingPost.authorId !== userId) {
    throw new Error("POST_NOT_FOUND");
  }

  const oldMediaId = existingPost.mediaId;

  const mediaWasReplaced = oldMediaId && mediaId && oldMediaId !== mediaId;

  const mediaWasRemoved = oldMediaId && !mediaId;

  if (mediaWasReplaced || mediaWasRemoved) {
    await cloudinary.uploader.destroy(oldMediaId, {
      resource_type: existingPost.mediaType === "video" ? "video" : "image",
    });
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      content: newContent,
      mediaUrl,
      mediaId,
      mediaType,
    },
  });

  return updatedPost;
};

exports.deletePost = async (postId, userId) => {
  // Check then delete if post exists and author is user
  const result = await prisma.post.deleteMany({
    where: { id: postId, authorId: userId },
  });

  if (result.count === 0) throw new Error("POST_NOT_FOUND");

  return result;
};
