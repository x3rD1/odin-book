function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const fieldErrors = {};

      for (const d of error.details) {
        const field = d.path.join(".");

        // Only keep the first error per field
        if (!fieldErrors[field]) {
          fieldErrors[field] = {
            field,
            message: d.message.replace(/"/g, ""),
          };
        }
      }

      return res.status(400).json({
        errors: Object.values(fieldErrors),
      });
    }

    req.body = value;
    next();
  };
}

module.exports = validate;
