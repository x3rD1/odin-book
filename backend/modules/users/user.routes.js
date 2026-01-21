const { Router } = require("express");
const router = Router();
const userController = require("./user.controller");
const followRoutes = require("../follows/follow.routes");

router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUser);
router.patch("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

router.use("/:userId/follow", followRoutes);

module.exports = router;
