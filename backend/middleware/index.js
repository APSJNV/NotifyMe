// Export all middleware
const { router: authRouter, verifyToken } = require('./auth');

module.exports = {
  authRouter,
  verifyToken
};