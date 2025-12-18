// src/middleware/handleJsonError.js

export function handleJsonError(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON in request body",
      error: true,
      success: false,
    });
  }
  next();
}
