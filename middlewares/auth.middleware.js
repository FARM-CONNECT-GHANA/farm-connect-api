import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';

// authentication middleware
export const authenticated = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error('JWT secret key is not defined');
    }

    const decoded = jwt.verify(token, secretKey);

    console.log('Token received:', token);
    console.log('Decoded token:', decoded);

    if (!decoded.id) {
      console.log('Invalid token structure');
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      console.log('User not found for id:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Authentication required' });
  }
};


// authorization middleware
export const authorized = (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user?.role;
  
      console.log('User Role:', userRole);
      console.log('Allowed Roles:', allowedRoles);
  
      if (!userRole) {
        console.log('Access denied. No role provided.');
        return res.status(403).json({ error: 'Access denied. No role provided.' });
      }
  
      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        console.log('Access denied. User does not have required permissions.');
        res.status(403).json({
          error: 'Access denied. You do not have the required permissions.',
        });
      }
    };
  };
  
  
  


