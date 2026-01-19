const commentService = require("./comment.service");

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
      cursorId
    );

    res.json(replies);
  } catch (err) {
    next(err);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;
    const content = req.body.content;

    await commentService.createComment(postId, userId, content);

    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
};

exports.createReply = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;
    const content = req.body.content;

    await commentService.createReply(postId, commentId, userId, content);

    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;
    const content = req.body.content;

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

    await commentService.deleteComment(postId, commentId, userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
