const prisma = require("../../lib/prisma");
const notifService = require("../notifications/notif.service");

exports.getAllComments = async (postId, cursorId) => {
  // Check then get if post exists
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      likes: { select: { userId: true } },
      user: { select: { id: true, username: true, profilePicture: true } },
      subcomments: { select: { id: true } },
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
        likes: { select: { userId: true } },
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

exports.createComment = async (
  postId,
  user,
  content,
  mediaUrl,
  mediaId,
  mediaType,
) => {
  try {
    // Check then create if posts exists
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          content,
          userId: user.id,
          postId,
          mediaUrl,
          mediaId,
          mediaType,
        },
        include: {
          post: { select: { authorId: true } },
          user: { select: { id: true, username: true, profilePicture: true } },
          likes: true,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    let notif = null;

    if (comment.post.authorId !== user.id) {
      notif = await notifService.createNotif({
        type: "COMMENT",
        actorId: user.id,
        receiverId: comment.post.authorId,
        postId,
        commentId: comment.id,
        message: `${user.username} commented on your post: "${content}"`,
      });
    }

    return { comment, notif };
  } catch (err) {
    if (err.code === "P2003") throw new Error("POST_NOT_FOUND");
    throw err;
  }
};

exports.createReply = async (
  postId,
  commentId,
  user,
  content,
  mediaUrl,
  mediaId,
  mediaType,
) => {
  try {
    const [reply] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          content,
          userId: user.id,
          postId,
          parentId: commentId,
          mediaUrl,
          mediaId,
          mediaType,
        },
        include: {
          parent: { select: { userId: true } },
          user: { select: { id: true, username: true, profilePicture: true } },
          likes: true,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    let notif = null;

    if (reply.parent && reply.parent.userId !== user.id) {
      notif = await notifService.createNotif({
        type: "REPLY",
        actorId: user.id,
        receiverId: reply.parent.userId,
        postId,
        commentId: reply.id,
        message: `${user.username} replied to your comment: "${content}"`,
      });
    }

    return { reply, notif };
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
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId },
    include: {
      post: { select: { authorId: true } },
      subcomments: { select: { id: true } },
    },
  });

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  const isCommentAuthor = comment.userId === userId;
  const isPostAuthor = comment.post.authorId === userId;

  if (!isCommentAuthor && !isPostAuthor) {
    throw new Error("FORBIDDEN");
  }

  const decrementBy =
    comment.parentId === null ? comment.subcomments.length + 1 : 1;

  await prisma.$transaction(async (tx) => {
    if (comment.parentId === null && comment.subcomments.length > 0) {
      await tx.comment.deleteMany({
        where: { parentId: commentId },
      });
    }

    await tx.comment.delete({
      where: { id: commentId },
    });

    await tx.post.update({
      where: { id: postId },
      data: { commentCount: { decrement: decrementBy } },
    });
  });

  await notifService.removeNotif({
    type: comment.parentId ? "REPLY" : "COMMENT",
    actorId: comment.userId,
    receiverId: comment.post.authorId,
    postId,
    commentId,
  });
};
