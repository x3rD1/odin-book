const { Router } = require("express");
const router = Router();
const notifController = require("./notif.controller");

router.get("/", notifController.getUserNotifs);
router.patch("/:id/read", notifController.markAsRead);
// router.patch("/read-all", notifController.markAllAsRead);

module.exports = router;
