const { Router } = require("express");
const router = Router({ mergeParams: true });
const commentLikeController = require("./commentLike.controller");

router.get("/", commentLikeController.getAllLikes);
router.post("/", commentLikeController.createLike);
router.delete("/", commentLikeController.deleteLike);

module.exports = router;
