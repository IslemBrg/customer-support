// services/ticketService.js - Handle business logic
import Ticket from '../models/Ticket.js';
import { TicketStatus } from '../utils/TicketUtils.js';
import UserService from './UserService.js';

class TicketService {
  async getAllTickets(sort = {'createdAt': -1}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const tickets = await Ticket.find()
    .populate('customer')
    .populate('agent')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
    const totalTickets = await Ticket.countDocuments();
    
    return {
    tickets: tickets,
    pagination: {
        totalItems: totalTickets,
        totalPages: Math.ceil(totalTickets / limit),
        currentPage: page,
        itemsPerPage: limit
    }
    };
  }
  
  // Get a single ticket by ID
  async getTicketById(ticketId) {
    const ticket = await findById(ticketId)
    .populate('customer')
    .populate('agent');
    
    if (!ticket) {
    throw new Error('Ticket not found');
    }
    
    return ticket;
  }
  
  // Create a new ticket
  async createTicket(ticketData) {
    let leastOccupiedAgent = await UserService.getLeastOccupiedAgent();
    let processedTicketData = {...ticketData, status: TicketStatus.PENDING, agent: leastOccupiedAgent}
    
    const ticket = new Ticket(processedTicketData);
    await ticket.save();
    
    return ticket;
  }

  // Update a ticket
  async updateTicket(ticketId, updateData) {
    const processedData = this.validateAndProcessUpdateData(updateData);
    
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId, 
      processedData,
      { new: true, runValidators: true }
    );
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  }
  
  // Delete a ticket
  async deleteTicket(ticketId) {
    const ticket = await Ticket.findByIdAndDelete(ticketId);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
  
    
    return { success: true, message: 'Ticket deleted' };
  }
  
  validateAndProcessUpdateData(updateData) {
    const allowedUpdates = ['status', 'priority', 'description'];
    const updates = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });
    
    return updates;
  }
  
}

export default new TicketService();