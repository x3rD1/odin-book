function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        errors: error.details.map((d) => ({
          field: d.path.join("."),
          message: d.message.replace(/"/g, ""),
        })),
      });
    }

    req.body = value;
    next();
  };
}

module.exports = validate;
