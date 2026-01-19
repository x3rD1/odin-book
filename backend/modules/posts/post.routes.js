const { Router } = require("express");
const router = Router();
const postController = require("./post.controller");
const commentRoutes = require("../comments/comment.routes");
const postLikeRoutes = require("../likes/postLikes/postLike.routes");

router.get("/", postController.getAllPosts);
router.get("/:postId", postController.getPost);
router.post("/", postController.createPost);
router.put("/:postId", postController.updatePost);
router.delete("/:postId", postController.deletePost);

router.use("/:postId/comments", commentRoutes);
router.use("/:postId/likes", postLikeRoutes);

module.exports = router;
