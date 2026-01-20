const userService = require("./user.service");

exports.getAllUsers = async (req, res, next) => {
  try {
    const cursorId = Number(req.query.cursor);

    const users = await userService.getAllUsers(cursorId);

    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    const user = await userService.getUser(userId);

    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    if (userId !== req.user.id)
      return res.status(403).json({ message: "Forbidden action" });

    await userService.updateUser(userId, req.body);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    if (userId !== req.user.id)
      return res.status(403).json({ message: "Forbidden action" });

    await userService.deleteUser(userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
