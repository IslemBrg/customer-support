// routes/adminRoutes.js
import express from 'express';
import auth from '../middlewares/auth.js';
import checkRole from '../middlewares/roles.js';
import * as authController from '../controllers/authController.js';
import * as adminController from '../controllers/adminController.js';

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

export default router;