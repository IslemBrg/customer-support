// routes/authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs';
import { Roles } from '../utils/AuthUtils.js';
import Config from '../utils/Config.js';
const JWT_SECRET = Config.jwtSecret;
const router = express.Router();
import User from '../models/User.js';
import adminMiddleware from '../middlewares/AdminMiddleware.js'


// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token.' });
        req.user = user;
        next();
    });
};


// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
    if (bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid email or password.' });
    }
});

// register customer
router.post('/customer/register', async (req, res) => {
    try{
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 15);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// register agent requires admin role
router.post('/agent/register', adminMiddleware, async (req, res) => {
    try{
        if (req.user.role !== Roles.ADMIN) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 15);
        const newUser = new User({ name, email, role:Roles.AGENT , password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Admin seeder
router.get('/admin/seed', async (req, res) => {
    try {
        const admin = await User.findOne({ role: Roles.ADMIN });
        if (admin) {
            return res.status(409).json({ message: 'Admin already exists.' });
        }
        const hashedPassword = await bcrypt.hash('pass123', 15);
        const newAdmin = new User({ name: 'Admin', email: 'admin@hpe.com', role: Roles.ADMIN, password: hashedPassword });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin seeded successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
