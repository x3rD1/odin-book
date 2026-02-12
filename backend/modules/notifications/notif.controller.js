const notifService = require("./notif.service");

exports.getUserNotifs = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    const notifs = await notifService.getUserNotifs(userId);

    res.json(notifs);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await notifService.markAsRead(Number(req.params.id), req.user.id);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
