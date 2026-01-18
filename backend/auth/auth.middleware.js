exports.requireAuth = (req, res, next) => {
  // Checks if the user is not logged in
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};
