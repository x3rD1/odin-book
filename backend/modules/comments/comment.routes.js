const { Router } = require("express");
const router = Router({ mergeParams: true });
const commentController = require("./comment.controller");
const commentLikeRoutes = require("../likes/commentLikes/commentLike.routes");

router.get("/", commentController.getAllComments);
router.get("/:commentId", commentController.getComment);
router.get("/:commentId/replies", commentController.getReplies);
router.post("/", commentController.createComment);
router.post("/:commentId/replies", commentController.createReply);
router.put("/:commentId", commentController.updateComment);
router.delete("/:commentId", commentController.deleteComment);

router.use("/:commentId/likes", commentLikeRoutes);

module.exports = router;
