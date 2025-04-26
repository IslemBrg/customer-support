// controllers/adminController.js
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';

export const getDashboard = async (req, res) => {
  try {
    // Get counts for dashboard summary
    const ticketCount = await Ticket.countDocuments();
    const pendingCount = await Ticket.countDocuments({ status: 'Pending' });
    const activeCount = await Ticket.countDocuments({ status: 'Active' });
    const monitoringCount = await Ticket.countDocuments({ status: 'Monitoring' });
    const closedCount = await Ticket.countDocuments({ status: 'Closed' });
    
    const agentCount = await User.countDocuments({ role: 'Agent' });
    const customerCount = await User.countDocuments({ role: 'Customer' });
    
    // Get recent tickets
    const recentTickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email')
      .populate('agent', 'name');
    
    res.render('admin/dashboard', {
      title: 'Dashboard',
      user: req.user,
      path: '/admin/dashboard',
      ticketCount,
      pendingCount,
      activeCount,
      monitoringCount,
      closedCount,
      agentCount,
      customerCount,
      recentTickets
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

export const getTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalTickets = await Ticket.countDocuments();
    const totalPages = Math.ceil(totalTickets / limit);
    
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name email')
      .populate('agent', 'name');
    
    res.render('admin/tickets', {
      title: 'Tickets',
      user: req.user,
      path: '/admin/tickets',
      tickets,
      currentPage: page,
      totalPages,
      totalItems: totalTickets,
      itemsPerPage: limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

export const getAgents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalAgents = await User.countDocuments({ role: 'Agent' });
    const totalPages = Math.ceil(totalAgents / limit);
    
    const agents = await User.find({ role: 'Agent' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get ticket counts for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const totalTickets = await Ticket.countDocuments({ agent: agent._id });
        const closedTickets = await Ticket.countDocuments({ 
          agent: agent._id,
          status: 'Closed'
        });
        
        return {
          ...agent._doc,
          totalTickets,
          closedTickets,
          completionRate: totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0
        };
      })
    );
    
    res.render('admin/agents', {
      title: 'Agents',
      user: req.user,
      path: '/admin/agents',
      agents: agentsWithStats,
      currentPage: page,
      totalPages,
      totalItems: totalAgents,
      itemsPerPage: limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalPages = Math.ceil(totalCustomers / limit);
    
    const customers = await User.find({ role: 'Customer' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get ticket counts for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const ticketCount = await Ticket.countDocuments({ customer: customer._id });
        return {
          ...customer._doc,
          ticketCount
        };
      })
    );
    
    res.render('admin/customers', {
      title: 'Customers',
      user: req.user,
      path: '/admin/customers',
      customers: customersWithStats,
      currentPage: page,
      totalPages,
      totalItems: totalCustomers,
      itemsPerPage: limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

export const getStatistics = async (req, res) => {
  try {
    // Get ticket status distribution
    const statusCounts = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get ticket creation trend (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const ticketTrend = await Promise.all(
      last7Days.map(async (date) => {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        const count = await Ticket.countDocuments({
          createdAt: { 
            $gte: startDate, 
            $lt: endDate 
          }
        });
        
        return { date, count };
      })
    );
    
    // Get agent performance stats
    const agents = await User.find({ role: 'Agent' });
    const agentStats = await Promise.all(
      agents.map(async (agent) => {
        const totalTickets = await Ticket.countDocuments({ agent: agent._id });
        const closedTickets = await Ticket.countDocuments({ 
          agent: agent._id,
          status: 'Closed'
        });
        
        return {
          name: agent.name,
          totalTickets,
          closedTickets,
          completionRate: totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0
        };
      })
    );
    
    res.render('admin/statistics', {
      title: 'Statistics',
      user: req.user,
      path: '/admin/statistics',
      statusCounts,
      ticketTrend,
      agentStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
};