// controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const getAdminLogin = (req, res) => {
  res.render('admin/login', { layout: false, error: null });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with provided email
    const user = await User.findOne({ email });
    
    if (!user || user.role !== 'Admin') {
      return res.render('admin/login', { error: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.render('admin/login', { error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set token in cookie
    res.cookie('token', token, {
      credentials: true,
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error);
    res.render('admin/login', { error: 'Server error' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin/login');
};