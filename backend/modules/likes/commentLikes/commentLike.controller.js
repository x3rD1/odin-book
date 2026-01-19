const commentLikeService = require("./commentLike.service");

exports.getAllLikes = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);

    const likes = await commentLikeService.getAllLikes(commentId);

    res.json(likes);
  } catch (err) {
    next(err);
  }
};

exports.createLike = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    // Check if commentId is valid
    if (Number.isNaN(commentId)) {
      return res.status(400).json({ message: "Invalid commentId" });
    }

    const userId = req.user.id;

    await commentLikeService.createLike(commentId, userId);

    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
};

exports.deleteLike = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    // Check if commentId is valid
    if (Number.isNaN(commentId)) {
      return res.status(400).json({ message: "Invalid commentId" });
    }

    const userId = req.user.id;

    await commentLikeService.deleteLike(commentId, userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
