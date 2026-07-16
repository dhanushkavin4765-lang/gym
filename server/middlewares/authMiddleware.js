import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Member from '../models/Member.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find admin
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized, admin user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const protectMemberOrAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 1. Try to find Admin first
      req.admin = await Admin.findById(decoded.id).select('-password');
      if (req.admin) {
        return next();
      }

      // 2. Try to find Member
      req.member = await Member.findById(decoded.id);
      if (req.member) {
        // Enforce that a Member can only access their own data
        const paramId = req.params.id || req.params.memberId;
        if (req.member._id.toString() !== paramId) {
          return res.status(403).json({ message: 'Not authorized, access denied' });
        }
        return next();
      }

      return res.status(401).json({ message: 'Not authorized, user not found' });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
