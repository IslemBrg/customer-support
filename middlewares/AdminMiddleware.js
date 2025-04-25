import checkRole from "./RoleMiddleware";

const adminMiddleware = checkRole('Admin');

export default adminMiddleware;