// middleware/roles.js
const checkRole = (role) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).redirect('/admin/login');
      }
      
      if (req.user.role !== role) {
        return res.status(403).render('error', { 
          message: 'Access denied. You do not have permission to view this page.' 
        });
      }
      
      next();
    };
  };
  
  export default checkRole;