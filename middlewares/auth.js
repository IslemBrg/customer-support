// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    console.log("COOKIES => ", req.cookies);
    const token = req.cookies.token || 
                  req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).redirect('/admin/login');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).redirect('/admin/login');
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).redirect('/admin/login');
  }
};

export default auth;