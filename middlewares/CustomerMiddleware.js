import checkRole from "./RoleMiddleware.js";

const customerMiddleware = checkRole('Customer');

export default customerMiddleware;