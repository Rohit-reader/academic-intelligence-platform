const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return sendError(res, err.message || 'Internal Server Error', statusCode);
};

module.exports = errorHandler;
