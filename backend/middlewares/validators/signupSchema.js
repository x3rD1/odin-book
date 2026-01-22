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
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.max": "Password must be at most 72 characters long",
      "string.pattern.base": "Password must contain at least one number",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string()
    .label("Confirm password")
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
    }),
});
