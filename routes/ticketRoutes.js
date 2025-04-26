import express from 'express';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs';
import { Roles } from '../utils/AuthUtils.js';
import { TicketStatus } from '../utils/TicketUtils.js';
import Config from '../utils/Config.js';
const JWT_SECRET = Config.jwtSecret;
const router = express.Router();
import adminMiddleware from '../middlewares/AdminMiddleware.js';
import agentMiddleware from '../middlewares/AgentMiddleware.js';
import customerMiddleware from '../middlewares/CustomerMiddleware.js';
import authenticationMiddleware from '../middlewares/AuthenticationMiddleware.js';
import TicketService from '../services/TicketService.js';

const Agents = [
    { id: 1, name: 'Agent 1', role: Roles.AGENT, email: 'agent1@hpe.com', password: bcrypt.hashSync('password1', 8) },
    { id: 2, name: 'Agent 2', role: Roles.AGENT, email: 'agent2@hpe.com', password: bcrypt.hashSync('password2', 8) },
    { id: 3, name: 'Agent 3', role: Roles.AGENT, email: 'agent3@hpe.com', password: bcrypt.hashSync('password3', 8) }
];
let tickets = [];
let ticketId = 1;



const getFreeAgent = () => {
    let AgentAgenda = {}
    Agents.forEach(agent => {
        AgentAgenda[agent.id] = 0;
    })
    tickets.forEach(ticket => {
        AgentAgenda[ticket.agent] = AgentAgenda[ticket.agent] || 0;
        AgentAgenda[ticket.agent]++;
    })
    let min = Math.min(...Object.values(AgentAgenda));
    let freeAgent = Object.keys(AgentAgenda).find(key => AgentAgenda[key] === min);
    return Agents.find(agent => agent.id == freeAgent);
}

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

// Ticket Routes
// router.post('/create', authenticateToken, (req, res) => {
//     const { title, description } = req.body;
//     if (!title || !description) {
//         return res.status(400).json({ message: 'Title and description are required.' });
//     }
//     const newTicket = { id: ticketId++, title, description, status: TicketStatus.PENDING, customer: req.user.id, agent: getFreeAgent().id };
//     tickets.push(newTicket);
//     res.status(201).json(newTicket);
// });

router.post('/create', customerMiddleware, (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
  }
  let ticketData = {title, description, customer: req.user._id};
  const newTicket = TicketService.createTicket(ticketData);
  res.status(201).json(newTicket);
});

// router.get('/getAll', authenticateToken, (req, res) => {
//     if (tickets.length === 0) return res.status(404).json({ message: 'No tickets found.' });
//     res.json(tickets);
// });

router.get('/getAll', adminMiddleware, async (req, res) => {
    try {
        // Parse query parameters & set default values if missing
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        
        const sortObj = {};
        sortObj[sort] = order;
        
        // Execute query with pagination
        let ticketPageable = await TicketService.getAllTickets(sortObj, page, limit);
        // Send response
        res.status(200).json(ticketPageable);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch tickets',
          error: error.message
        });
      }
});

router.get('/getById/:id', authenticateToken, (req, res) => {
    const ticket = tickets.find(t => t.id == req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    res.json(ticket);
});

// Other ticket routes can go here (same as before)

export default router;
