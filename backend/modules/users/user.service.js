const prisma = require("../../lib/prisma");

exports.getAllUsers = async (cursorId) => {
  const users = await prisma.user.findMany({
    take: 10,
    cursor: cursorId ? { id: cursorId } : undefined,
    skip: cursorId ? 1 : 0,
    orderBy: { id: "asc" },
    select: {
      id: true,
      username: true,
      profilePicture: true,
    },
  });

  const nextCursor = users.length ? users[users.length - 1].id : null;

  return { users, nextCursor };
};

exports.getUser = async (userId) => {
  // Check then get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profilePicture: true,
      createdAt: true,
      posts: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          likes: { select: { userId: true } },
          comments: { select: { id: true } },
          author: {
            select: { id: true, username: true, profilePicture: true },
          },
        },
      },
    },
  });
  // Throw error
  if (!user) throw new Error("USER_NOT_FOUND");

  return user;
};

exports.updateUser = async (userId, { username, email, profilePicture }) => {
  const data = {};
  if (username !== undefined) data.username = username;
  if (email !== undefined) data.email = email;
  if (profilePicture !== undefined) data.profilePicture = profilePicture;

  // Check then update user
  const updatedUser = await prisma.user.updateMany({
    where: { id: userId },
    data,
  });

  if (updatedUser.count === 0) throw new Error("USER_NOT_FOUND");

  return updatedUser;
};

exports.deleteUser = async (userId) => {
  // Check then delete user
  const deletedUser = await prisma.user.deleteMany({ where: { id: userId } });

  if (deletedUser.count === 0) throw new Error("USER_NOT_FOUND");

  return deletedUser;
};
