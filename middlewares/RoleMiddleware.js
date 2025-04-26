import jwt from 'jsonwebtoken'


const checkRole = (requiredRole) => {
  
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: 'No token provided or invalid format.'
        });
      }
      
      const token = authHeader.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const hasRequiredRole = requiredRole === decoded.role;
      
      if (!hasRequiredRole) {
        return res.status(403).json({
          message: `Access denied. Insufficient Permissions.`
        });
      }
      
      req.user = decoded;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expired. Please login again.'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Invalid token. Please login again.'
        });
      }
      
      console.error('JWT authorization error:', error);
      return res.status(500).json({
        message: 'Internal server error during authorization.'
      });
    }
  };
};

export default checkRole;