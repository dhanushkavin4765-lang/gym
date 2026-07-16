import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const members = await Member.find().populate('plan');
  console.log('--- Database Members ---');
  members.forEach(m => {
    console.log(`Name: ${m.fullName} | ID: ${m.memberId} | PIN: ${m.pin} | Status: ${m.status} | Expiry: ${m.expiryDate}`);
  });
  process.exit(0);
};

run();
