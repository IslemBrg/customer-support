import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import { Roles } from "../utils/AuthUtils.js";
import { TicketStatus } from "../utils/TicketUtils.js";

class UserService {

    async getLeastOccupiedAgent() {
        let agents = User.find({role: Roles.AGENT});
        let tickets = Ticket.find({status : [TicketStatus.ACTIVE, TicketStatus.MONITORING, TicketStatus.PENDING]})
        let agentAgenda = {};
        agents.forEach(agent => {
            agentAgenda[agent.id] = 0;
        })
        tickets.forEach(ticket => {
            agentAgenda[ticket.agent]++;
        })
        let min = Math.min(...Object.values(agentAgenda));
        let freeAgent = Object.keys(agentAgenda).find(key => agentAgenda[key] === min);
        return agents.find(agent => agent.id == freeAgent);
    }

}

export default new UserService();