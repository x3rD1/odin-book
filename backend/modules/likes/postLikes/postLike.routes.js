const { Router } = require("express");
const router = Router({ mergeParams: true });
const postLikeController = require("./postLike.controller");
const { requireAuth } = require("../../../auth/auth.middleware");

router.get("/", postLikeController.getAllLikes);
router.post("/", requireAuth, postLikeController.createLike);
router.delete("/", requireAuth, postLikeController.deleteLike);

module.exports = router;
