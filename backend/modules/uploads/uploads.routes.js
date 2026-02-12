const { Router } = require("express");
const cloudinary = require("../../lib/cloudinary");
const upload = require("../../middlewares/upload");

const router = Router();

router.post("/media", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const isImage = req.file.mimetype.startsWith("image");
    const isVideo = req.file.mimetype.startsWith("video");

    if (!isImage && !isVideo) {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    if (isImage && req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: "Image exceeds 10MB limit" });
    }

    if (isVideo && req.file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ message: "Video exceeds 50MB limit" });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: `social_app/posts/${req.user.id}`,
        resource_type: "auto",
      },
    );

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
