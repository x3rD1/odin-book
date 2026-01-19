const { Router } = require("express");
const router = Router({ mergeParams: true });
const commentLikeController = require("./commentLike.controller");
const { requireAuth } = require("../../../auth/auth.middleware");

router.get("/", commentLikeController.getAllLikes);
router.post("/", requireAuth, commentLikeController.createLike);
router.delete("/", requireAuth, commentLikeController.deleteLike);

module.exports = router;
