import checkRole from "./RoleMiddleware";

const customerMiddleware = checkRole('Customer');

export default customerMiddleware;