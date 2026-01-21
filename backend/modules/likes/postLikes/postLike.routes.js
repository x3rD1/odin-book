const { Router } = require("express");
const router = Router({ mergeParams: true });
const postLikeController = require("./postLike.controller");

router.get("/", postLikeController.getAllLikes);
router.post("/", postLikeController.createLike);
router.delete("/", postLikeController.deleteLike);

module.exports = router;
