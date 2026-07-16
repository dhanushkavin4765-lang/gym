import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';

dotenv.config();

const seedTestMember = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for member seeding.');

    // Find the standard 1-month plan
    const plan = await Plan.findOne({ name: '1 Month Standard' });
    if (!plan) {
      console.log('Default plans not seeded. Please run server first to seed default plans.');
      process.exit(1);
    }

    // Check if test member already exists
    const existingMember = await Member.findOne({ memberId: 'GYM-1025' });
    if (existingMember) {
      console.log('Test member Dhanush (GYM-1025) already exists.');
      process.exit(0);
    }

    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 30); // 30 days active

    await Member.create({
      memberId: 'GYM-1025',
      pin: '1025',
      fullName: 'Dhanush',
      mobile: '9876543210',
      gender: 'Male',
      age: 24,
      address: '123 Strength Street, New York',
      height: 180,
      weight: 75,
      emergencyContact: '9876543211',
      plan: plan._id,
      joiningDate: today,
      expiryDate: expiry,
      durationMonths: 1,
      feesTotal: plan.feeAmount,
      feesPaid: plan.feeAmount,
      feesPending: 0,
      paymentStatus: 'Paid',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      status: 'Active',
      weightHistory: [{ weight: 75, date: today }]
    });

    console.log('Test member Dhanush (GYM-1025) with PIN 1025 seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding test member:', err.message);
    process.exit(1);
  }
};

seedTestMember();
