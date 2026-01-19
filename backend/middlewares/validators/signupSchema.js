const Joi = require("joi");

exports.signupSchema = Joi.object({
  username: Joi.string()
    .label("Username")
    .pattern(/^[A-Za-z]+$/)
    .min(3)
    .max(16)
    .required(),

  email: Joi.string()
    .label("Email")
    .email({ tlds: { allow: false } })
    .max(255)
    .required(),

  password: Joi.string()
    .label("Password")
    .min(6)
    .max(72)
    .pattern(/^(?=.*\d).+$/)
    .required(),

  confirmPassword: Joi.string()
    .label("Confirm password")
    .valid(Joi.ref("password"))
    .required(),
});
