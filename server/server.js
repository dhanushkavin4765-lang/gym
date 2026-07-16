import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/auth.js';
import memberRoutes from './routes/members.js';
import attendanceRoutes from './routes/attendance.js';
import paymentRoutes from './routes/payments.js';
import planRoutes from './routes/plans.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';
import trainerRoutes from './routes/trainers.js';

// Models for Seeding
import Admin from './models/Admin.js';
import Plan from './models/Plan.js';

// Membership Sweep
import { checkAndUpdateAllMemberships } from './utils/membershipHelper.js';

// Initialize Environment Variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for Base64 photos
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/trainers', trainerRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Gym Management System API is running...');
});

// Seed Initial Admin and Plans
const seedData = async () => {
  try {
    // 1. Seed Admin
    const adminCount = await Admin.countDocuments({});
    if (adminCount === 0) {
      await Admin.create({
        name: 'Gym Administrator',
        email: 'admin@gym.com',
        password: 'Admin@123',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
      });
      console.log('Seeded default admin credentials: admin@gym.com / Admin@123');
    }

    // 2. Seed Default Plans
    const planCount = await Plan.countDocuments({});
    if (planCount === 0) {
      const defaultPlans = [
        { name: '1 Month Standard', durationMonths: 1, feeAmount: 50, description: 'Access to gym cardio & strength sections' },
        { name: '3 Month Elite', durationMonths: 3, feeAmount: 130, description: 'Standard access + weekly trainer consultations' },
        { name: '6 Month Pro', durationMonths: 6, feeAmount: 240, description: 'Standard access + free diet plans' },
        { name: '12 Month VIP Platinum', durationMonths: 12, feeAmount: 400, description: 'Full access + personal locker + 12 trainer sessions' }
      ];
      await Plan.insertMany(defaultPlans);
      console.log('Seeded default membership plans');
    }

    // 3. Run initial sweep of memberships
    await checkAndUpdateAllMemberships();
    console.log('Membership status verification sweep completed.');
  } catch (error) {
    console.error('Seeding/Sweep Error:', error.message);
  }
};

seedData();

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
