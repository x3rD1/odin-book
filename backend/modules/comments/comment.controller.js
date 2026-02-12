const commentService = require("./comment.service");
const cloudinary = require("../../lib/cloudinary");

exports.getAllComments = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const cursorId = Number(req.query.cursor);

    const comments = await commentService.getAllComments(postId, cursorId);

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

exports.getComment = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);

    const comment = await commentService.getComment(postId, commentId);

    res.json(comment);
  } catch (err) {
    next(err);
  }
};

exports.getReplies = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const cursorId = Number(req.query.cursor);

    const replies = await commentService.getReplies(
      postId,
      commentId,
      cursorId,
    );

    res.json(replies);
  } catch (err) {
    next(err);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const user = req.user;
    const content = req.body.content?.trim() || null;
    const mediaUrl = req.body.mediaUrl || null;
    const mediaId = req.body.mediaId || null;
    const mediaType = req.body.mediaType || null;

    const newComment = await commentService.createComment(
      postId,
      user,
      content,
      mediaUrl,
      mediaId,
      mediaType,
    );

    res.json(newComment);
  } catch (err) {
    next(err);
  }
};

exports.createReply = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const user = req.user;
    const content = req.body.content?.trim() || null;
    const mediaUrl = req.body.mediaUrl || null;
    const mediaId = req.body.mediaId || null;
    const mediaType = req.body.mediaType || null;

    const newReply = await commentService.createReply(
      postId,
      commentId,
      user,
      content,
      mediaUrl,
      mediaId,
      mediaType,
    );

    res.json(newReply);
  } catch (err) {
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;
    const content = req.body.content.trim();

    await commentService.updateComment(postId, commentId, userId, content);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;

    const comment = await commentService.getComment(postId, commentId);

    if (!comment) throw new Error("COMMENT_NOT_FOUND");
    console.log("Deleting:", comment.mediaId, comment.mediaType);

    if (comment.mediaId) {
      await cloudinary.uploader.destroy(comment.mediaId, {
        resource_type: comment.mediaType === "video" ? "video" : "image",
      });
    }

    await commentService.deleteComment(postId, commentId, userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
