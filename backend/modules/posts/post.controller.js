const postService = require("./post.service");
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
    const content = req.body.content;
    const userId = req.user.id;

    await postService.createPost(content, userId);

    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const newContent = req.body.content;
    const userId = req.user.id;

    await postService.updatePost(postId, newContent, userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;

    await postService.deletePost(postId, userId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
