const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_smart_hostel_platform_2026', {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
