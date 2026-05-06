
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

// 檢查是否為管理員的中間件
const admin = (req, res, next) => {
  // req.user 是在之前的 protect 中間件裡從資料庫抓出來並存進去的
  if (req.user && req.user.role === 'admin') {
    next(); // 是 admin，放行
  } else {
    res.status(403).json({ message: '權限不足，僅限管理員存取' });
  }
};
module.exports = { protect,admin };

