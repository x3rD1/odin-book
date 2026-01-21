const followService = require("./follow.service");

exports.toggleFollow = async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.userId);
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId)
      return res.status(403).json({ message: "Cannot follow yourself" });

    const result = await followService.toggleFollow(
      targetUserId,
      currentUserId,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getFollowStatus = async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.userId);
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId)
      return res.status(403).json({ message: "Forbidden action" });

    const result = await followService.getFollowStatus(
      targetUserId,
      currentUserId,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getAllFollowing = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const cursorId = Number(req.query.cursorId);

    const following = await followService.getAllFollowing(userId, cursorId);

    res.json(following);
  } catch (err) {
    next(err);
  }
};

exports.getAllFollowers = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const cursorId = Number(req.query.cursorId);

    const followers = await followService.getAllFollowers(userId, cursorId);

    res.json(followers);
  } catch (err) {
    next(err);
  }
};
