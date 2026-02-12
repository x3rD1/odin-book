const { Router } = require("express");
const router = Router();

router.get("/search", async (req, res) => {
  const { q, offset } = req.query;
  const API_KEY = process.env.GIPHY_API_KEY;

  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(q)}&limit=25&offset=${offset || 0}`,
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "GIF search failed" });
  }
});

module.exports = router;
