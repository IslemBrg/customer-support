import checkRole from "./RoleMiddleware.js";

const adminMiddleware = checkRole('Admin');

export default adminMiddleware;