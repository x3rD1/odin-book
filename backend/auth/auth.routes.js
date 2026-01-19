const { Router } = require("express");
const router = Router();
const authController = require("./auth.controller");
const validate = require("../middlewares/validators/validate");
const { signupSchema } = require("../middlewares/validators/signupSchema");

router.post("/login", authController.login);
router.post("/signup", validate(signupSchema), authController.signup);

module.exports = router;
