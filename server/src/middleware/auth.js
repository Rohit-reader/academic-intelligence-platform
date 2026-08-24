const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_academic_intelligence_jwt_key_2026');

      req.user = await User.findById(decoded.id).select('-password').populate('department');

      if (!req.user || !req.user.isActive) {
        return sendError(res, 'User account is inactive or no longer exists', 401);
      }

      return next();
    } catch (error) {
      console.error('Auth verification failed:', error.message);
      return sendError(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token provided', 401);
  }
};

module.exports = { protect };
