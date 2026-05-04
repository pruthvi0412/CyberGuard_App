/**
 * Middleware to parse JSON strings in multipart/form-data requests.
 * This is needed because multer puts all non-file fields into req.body as strings,
 * and express-validator runs before we can manually parse them in the controller.
 */
exports.parseNestedFields = (fields) => {
  return (req, res, next) => {
    if (req.body) {
      fields.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
          try {
            req.body[field] = JSON.parse(req.body[field]);
          } catch (err) {
            // If it's not valid JSON, leave it as is and let validation catch it
          }
        }
      });
    }
    next();
  };
};
