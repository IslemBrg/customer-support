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
  async getTicketByNum(ticketNumber) {
    const ticket = await Ticket.findOne({ticketNumber: ticketNumber})
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
    // get random 10 digit int that does not exist in the database
    let ticketNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    let existingTicket = await Ticket.findOne({ticketNumber: ticketNumber});
    while (existingTicket) {
      ticketNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      existingTicket = await Ticket.findOne({ticketNumber: ticketNumber});
    }
    let processedTicketData = {...ticketData, ticketNumber, status: TicketStatus.PENDING, agent: leastOccupiedAgent}
    
    const ticket = new Ticket(processedTicketData);
    console.log(ticket);
    await ticket.save();
    
    return ticket;
  }

  // Update a ticket
  async updateTicket(ticketNumber, updateData) {
    const processedData = this.validateAndProcessUpdateData(updateData);
    const ticket = await Ticket.updateOne(
      { ticketNumber: ticketNumber },
      { $set: processedData },
      { new: true }
    ).populate('customer')
    .populate('agent');

    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  }
  
  // Delete a ticket
  async deleteTicket(ticketNumber) {
    const ticket = await Ticket.findOneAndDelete({ ticketNumber: ticketNumber });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
  
    
    return { success: true, message: 'Ticket deleted' };
  }
  
  validateAndProcessUpdateData(updateData) {
    const allowedUpdates = ['status', 'priority', 'description', 'title'];
    const updates = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });
    
    return updates;
  }

  // filter tickets by everything
  async filterTickets(filter) {
    const tickets = await Ticket.find(filter)
    .populate('customer')
    .populate('agent');

    if (!tickets) {
      throw new Error('No tickets found');
    }

    return tickets;

  }
  
}

export default new TicketService();