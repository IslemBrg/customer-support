// routes/authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs';
import { JWT_SECRET, Roles } from '../utils/AuthUtils.js';

const router = express.Router();



const Agents = [
    { id: 1, name: 'Agent 1', role: Roles.AGENT, email: 'agent1@hpe.com', password: bcrypt.hashSync('password1', 8) },
    { id: 2, name: 'Agent 2', role: Roles.AGENT, email: 'agent2@hpe.com', password: bcrypt.hashSync('password2', 8) },
    { id: 3, name: 'Agent 3', role: Roles.AGENT, email: 'agent3@hpe.com', password: bcrypt.hashSync('password3', 8) }
];

const Customers = [
    { id: 1, name: 'Paul', role: Roles.CUSTOMER, email: 'paul@gmail.com', password: bcrypt.hashSync('customer1', 8) },
    { id: 2, name: 'Philippe', role: Roles.CUSTOMER, email: 'philippe@gmail.com', password: bcrypt.hashSync('customer2', 8) },
    { id: 3, name: 'Humphray', role: Roles.CUSTOMER, email: 'humphray@gmail.com', password: bcrypt.hashSync('customer3', 8) }
];
// In-memory storage for users


// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
};

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = [...Agents, ...Customers].find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    if (bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid email or password.' });
    }
});

export default router;
