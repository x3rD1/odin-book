const postLikeService = require("./postLike.service");

exports.getAllLikes = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);

    const likes = await postLikeService.getAllLikes(postId);

    res.json(likes);
  } catch (err) {
    next(err);
  }
};

exports.createLike = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    // Check if postId is valid
    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }

    const user = req.user;

    const result = await postLikeService.createLike(postId, user);

    // Returns the notification id
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteLike = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    // Check if postId is valid
    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }

    const userId = req.user.id;

    await postLikeService.deleteLike(postId, userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
