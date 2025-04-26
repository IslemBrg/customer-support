// routes/adminRoutes.js
import express from 'express';
import auth from '../middlewares/auth.js';
import checkRole from '../middlewares/roles.js';
import * as authController from '../controllers/authController.js';
import * as adminController from '../controllers/adminController.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { Roles } from '../utils/AuthUtils.js';

const router = express.Router();

// Authentication routes
router.get('/login', authController.getAdminLogin);
router.post('/login', authController.adminLogin);
router.get('/logout', authController.logout);

// Dashboard routes - all protected by auth middleware
router.get('/dashboard', auth, checkRole('Admin'), adminController.getDashboard);
router.get('/tickets', auth, checkRole('Admin'), adminController.getTickets);
router.get('/agents', auth, checkRole('Admin'), adminController.getAgents);
router.get('/customers', auth, checkRole('Admin'), adminController.getCustomers);
router.get('/statistics', auth, checkRole('Admin'), adminController.getStatistics);

router.post('/agents/delete', auth, checkRole('Admin'), async (req, res) => {
    const { agentId } = req.body;
    console.log(req.body);
    try {
        await User.findByIdAndDelete(agentId);
        res.status(200).redirect('/admin/agents');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting agent.', error });
    }
});

router.post('/agents/register', auth, checkRole('Admin'), async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 15);
        const newUser = new User({ name, email, role: 'Agent', password: hashedPassword });
        await newUser.save();

        res.status(201).redirect('/admin/agents');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;