const prisma = require("../../lib/prisma");

exports.getUserNotifs = async (userId) => {
  const notifs = await prisma.notification.findMany({
    where: { receiverId: userId },
    include: {
      actor: { select: { id: true, username: true, profilePicture: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return notifs;
};

exports.createNotif = async ({
  type,
  actorId,
  receiverId,
  postId = null,
  commentId = null,
  message,
}) => {
  if (receiverId === actorId) return;

  const existing = await prisma.notification.findFirst({
    where: {
      type,
      actorId,
      receiverId,
      postId,
      commentId,
    },
  });

  if (existing) return existing;

  return prisma.notification.create({
    data: { type, actorId, receiverId, postId, commentId, message },
  });
};

exports.removeNotif = async ({
  type,
  actorId,
  receiverId,
  postId = null,
  commentId = null,
}) => {
  await prisma.notification.deleteMany({
    where: {
      type,
      actorId,
      receiverId,
      postId,
      commentId,
    },
  });
};

exports.markAsRead = async (notifId, userId) => {
  const result = await prisma.notification.updateMany({
    where: { id: notifId, receiverId: userId },
    data: { isRead: true },
  });

  if (result.count === 0) {
    throw new Error("NOTIF_NOT_FOUND");
  }
};
