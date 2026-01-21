function errorHandler(err, req, res, next) {
  switch (err && err.message) {
    case "EMAIL_ALREADY_EXISTS":
      return res
        .status(409)
        .json({ field: "email", message: "Email already in use" });

    case "USERNAME_ALREADY_EXISTS":
      return res
        .status(409)
        .json({ field: "username", message: "Username already in use" });

    case "INVALID_CREDENTIALS":
      return res.status(401).json({
        message: "Invalid email or password",
      });

    case "USER_NOT_FOUND":
      return res.status(404).json({ message: "User not found" });

    case "POST_NOT_FOUND":
      return res.status(404).json({ message: "Post not found" });

    case "COMMENT_NOT_FOUND":
      return res.status(404).json({ message: "Comment not found" });

    case "LIKE_NOT_FOUND":
      return res.status(404).json({ message: "Not liked" });

    case "LIKE_ALREADY_EXISTS":
      return res.status(409).json({ message: "Post already liked" });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({ message: "Internal server error" });
}

module.exports = errorHandler;
