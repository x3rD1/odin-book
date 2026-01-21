const { Router } = require("express");
const router = Router({ mergeParams: true });
const followController = require("./follow.controller");

router.post("/", followController.toggleFollow);
router.get("/status", followController.getFollowStatus);
router.get("/following", followController.getAllFollowing);
router.get("/followers", followController.getAllFollowers);

module.exports = router;
