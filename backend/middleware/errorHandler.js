/**
 * Global Express error-handling middleware.
 * Must be registered AFTER all routes.
 */
function errorHandler(err, _req, res, _next) {
  console.error('[ERROR]', err.stack || err.message || err);

  const status = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
