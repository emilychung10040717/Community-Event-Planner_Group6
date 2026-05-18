
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to check whether the user is an administrator
const admin = (req, res, next) => {
  // // req.user is retrieved from the previous protect middleware
  // after validating the user from the database
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, allow access
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges only.' });
  }
};
module.exports = { protect,admin };

