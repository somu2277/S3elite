const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  console.log(`[AUTH] Checking authorization header: ${req.headers.authorization}`);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(`[AUTH] Extracted token: ${token}`);
      
      // Allow the frontend dev demo token to bypass strict JWT verification
      if (token === 'jwt_whatsapp_otp_verified_token_2026') {
        console.log('[AUTH] Dev token recognized! Bypassing...');
        req.user = {
          _id: 'admin_shiva_01',
          name: 'Shiva (Enterprise Admin)',
          email: 'shiva@s3elite.in',
          role: 'admin'
        };
        console.log('[AUTH] Set req.user to admin, calling next().');
        return next();
      }

      // Try verifying with the primary secret
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_smart_hostel_platform_2026');
        console.log('[AUTH] Token verified with primary secret.');
      } catch (err) {
        // Fallback for Admin token which might be signed with the enterprise secret
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'enterprise_super_secret_jwt_key_2026');
        console.log('[AUTH] Token verified with enterprise secret.');
      }

      // Handle hardcoded Admin user
      if (decoded.id === 'admin_shiva_01' || decoded.role === 'owner') {
        req.user = {
          _id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: 'admin' // normalize role to 'admin' for authorize('admin')
        };
        console.log('[AUTH] Hardcoded admin user processed.');
      } else {
        req.user = await User.findById(decoded.id).select('-password');
        console.log(`[AUTH] Standard user retrieved: ${req.user ? req.user.email : 'null'}`);
      }
      
      return next();
    } catch (error) {
      console.error('[AUTH] Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  console.log('[AUTH] No token provided!');
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`[AUTH] Authorize check. Requires: ${roles}. User role: ${req.user?.role}`);
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('[AUTH] Authorization failed! Returning 403.');
      return res.status(403).json({
        message: `Role (${req.user?.role}) is not authorized to access this route`
      });
    }
    console.log('[AUTH] Authorization passed! Calling next().');
    next();
  };
};

module.exports = { protect, authorize };
