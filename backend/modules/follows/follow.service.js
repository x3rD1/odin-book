const prisma = require("../../lib/prisma");

exports.toggleFollow = async (targetUserId, currentUserId) => {
  try {
    await prisma.follow.create({
      data: { followerId: currentUserId, followingId: targetUserId },
    });
    return { followed: true };
  } catch (err) {
    if (err.code === "P2002") {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });
      return { followed: false };
    }
    if (err.code === "P2003") {
      throw new Error("USER_NOT_FOUND");
    }

    throw err;
  }
};

exports.getFollowStatus = async (targetUserId, currentUserId) => {
  const targetExisting = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });

  if (!targetExisting) throw new Error("USER_NOT_FOUND");

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });

  if (!existing) return { follow: false };

  return { follow: true };
};

exports.getAllFollowing = async (userId, cursorId) => {
  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) throw new Error("USER_NOT_FOUND");

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: {
      id: true,
      following: { select: { id: true, username: true, profilePicture: true } },
    },
    take: 10,
    cursor: cursorId ? { id: cursorId } : undefined,
    skip: cursorId ? 1 : 0,
    orderBy: { id: "asc" },
  });

  const nextCursor = following.length
    ? following[following.length - 1].id
    : null;

  return { following, nextCursor };
};

exports.getAllFollowers = async (userId, cursorId) => {
  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) throw new Error("USER_NOT_FOUND");

  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    select: {
      id: true,
      follower: { select: { id: true, username: true, profilePicture: true } },
    },
    take: 10,
    cursor: cursorId ? { id: cursorId } : undefined,
    skip: cursorId ? 1 : 0,
    orderBy: { id: "asc" },
  });

  const nextCursor = followers.length
    ? followers[followers.length - 1].id
    : null;

  return { followers, nextCursor };
};
