const postService = require("./post.service");
const cloudinary = require("../../lib/cloudinary");
// /posts
exports.getAllPosts = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const cursorId = Number(req.query.cursor);
    // Get posts from user and following
    const posts = await postService.getAllPosts(userId, cursorId);

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);

    // Get post with an id of postId
    const post = await postService.getPost(postId);

    res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const content = req.body.content?.trim() || null;
    const mediaUrl = req.body.mediaUrl || null;
    const mediaId = req.body.mediaId || null;
    const mediaType = req.body.mediaType || null;

    if (!content && !mediaUrl) {
      return res.status(400).json({
        message: "Post must contain text or media",
      });
    }

    const post = await postService.createPost({
      content,
      mediaUrl,
      mediaId,
      mediaType,
      userId,
    });

    res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;

    const newContent =
      typeof req.body.content === "string"
        ? req.body.content.trim()
        : undefined;

    await postService.updatePost({
      postId,
      newContent,
      mediaUrl: req.body.mediaUrl,
      mediaId: req.body.mediaId,
      mediaType: req.body.mediaType,
      userId,
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;

    const post = await postService.getPost(postId);

    if (!post) throw new Error("POST_NOT_FOUND");

    if (post.mediaId) {
      await cloudinary.uploader.destroy(post.mediaId, {
        resource_type: post.mediaType === "video" ? "video" : "image",
      });
    }

    await postService.deletePost(postId, userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
