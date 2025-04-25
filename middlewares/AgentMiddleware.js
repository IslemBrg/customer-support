import checkRole from "./RoleMiddleware.js";

const agentMiddleware = checkRole('Agent');

export default agentMiddleware;