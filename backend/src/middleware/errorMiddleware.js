export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || "Server error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
  });
};
