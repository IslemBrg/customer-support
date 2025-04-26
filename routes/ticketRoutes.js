import express from 'express';
import jwt from 'jsonwebtoken'
import Config from '../utils/Config.js';
const JWT_SECRET = Config.jwtSecret;
const router = express.Router();
import adminMiddleware from '../middlewares/AdminMiddleware.js';
import agentmiddlewhere from '../middlewares/AgentMiddleware.js';
import customerMiddleware from '../middlewares/CustomerMiddleware.js';
import TicketService from '../services/TicketService.js';



// const getFreeAgent = () => {
//     let AgentAgenda = {}
//     Agents.forEach(agent => {
//         AgentAgenda[agent.id] = 0;
//     })
//     tickets.forEach(ticket => {
//         AgentAgenda[ticket.agent] = AgentAgenda[ticket.agent] || 0;
//         AgentAgenda[ticket.agent]++;
//     })
//     let min = Math.min(...Object.values(AgentAgenda));
//     let freeAgent = Object.keys(AgentAgenda).find(key => AgentAgenda[key] === min);
//     return Agents.find(agent => agent.id == freeAgent);
// }

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
  let ticketData = {title, description, customer: req.user.id};
  const newTicket = TicketService.createTicket(ticketData);
  res.status(201).json(newTicket);
});

// router.get('/getAll', authenticateToken, (req, res) => {
//     if (tickets.length === 0) return res.status(404).json({ message: 'No tickets found.' });
//     res.json(tickets);
// });

router.get('/getAll', agentmiddlewhere, async (req, res) => {
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

router.get('/getByNumber/:num', authenticateToken, async (req, res) => {
    const ticket = await TicketService.getTicketByNum(req.params.num);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    res.json(ticket);
});

router.patch('/updateByNumber/:number', agentmiddlewhere, async (req, res) => {
    const ticketNumber = req.params.number;
    const updateData = req.body;
    try {
        // Validate update data (e.g., check for required fields)
        if (!updateData.title && !updateData.description && !updateData.status) {
            return res.status(400).json({ message: 'At least one field (title, description, status) is required for update.' });
        }
        // Check if the ticket exists
        const existingTicket = await TicketService.getTicketByNum(ticketNumber);
        if (!existingTicket) return res.status(404).json({ message: 'Ticket not found.' });
        // check the status of the ticket
        if (existingTicket.status === 'Closed') return res.status(400).json({ message: 'Cannot update a closed ticket.' });
        // check the status format
        if (updateData.status && !['Pending', 'Active', 'Monitoring', 'Closed'].includes(updateData.status)) {
            return res.status(400).json({ message: 'Invalid status value. Allowed values are: Pending, Active, Monitoring, Closed.' });
        }
        // Update the ticket
        const updatedTicket = await TicketService.updateTicket(ticketNumber, updateData);
        if (!updatedTicket) return res.status(404).json({ message: 'Ticket not found.' });
        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: 'Error updating ticket.', error: error.message });
    }
});

router.delete('/deleteByNumber/:number', agentmiddlewhere, async (req, res) => {
    const ticketNumber = req.params.number;
    try {
        const deletedTicket = await TicketService.deleteTicket(ticketNumber);
        if (!deletedTicket) return res.status(404).json({ message: 'Ticket not found.' });
        res.json({ message: 'Ticket deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting ticket.', error: error.message });
    }
});

// filter tickets by everything
router.get('/filter', authenticateToken, async (req, res) => {
    const { status, customer, agent } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (agent) filter.agent = agent;
    
    try {
        const tickets = await TicketService.filterTickets(filter);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error filtering tickets.', error: error.message });
    }
});

// Other ticket routes can go here (same as before)

export default router;
