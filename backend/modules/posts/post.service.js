const prisma = require("../../lib/prisma");

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
        select: { id: true },
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

exports.createPost = (content, userId) => {
  return prisma.post.create({ data: { content, authorId: userId } });
};

exports.updatePost = async (postId, newContent, userId) => {
  // Check then update if post exists and author is user
  const result = await prisma.post.updateMany({
    where: { id: postId, authorId: userId },
    data: { content: newContent },
  });

  if (result.count === 0) throw new Error("POST_NOT_FOUND");

  return result;
};

exports.deletePost = async (postId, userId) => {
  // Check then delete if post exists and author is user
  const result = await prisma.post.deleteMany({
    where: { id: postId, authorId: userId },
  });

  if (result.count === 0) throw new Error("POST_NOT_FOUND");

  return result;
};
