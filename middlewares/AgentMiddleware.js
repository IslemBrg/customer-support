import checkRole from "./RoleMiddleware";

const agentMiddleware = checkRole('Agent');

export default agentMiddleware;