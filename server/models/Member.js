import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  pin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 4,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'],
  },
  age: {
    type: Number,
    required: true,
    min: 1,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  height: {
    type: Number, // in cm
    required: true,
    min: 1,
  },
  weight: {
    type: Number, // in kg
    required: true,
    min: 1,
  },
  emergencyContact: {
    type: String,
    required: true,
    trim: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  durationMonths: {
    type: Number,
    required: true,
  },
  feesTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  feesPaid: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  feesPending: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Partially Paid'],
    default: 'Pending',
  },
  photo: {
    type: String, // Base64 member photo
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Expiring Soon', 'Expired'],
    default: 'Active',
  },
  weightHistory: [
    {
      weight: Number,
      date: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

// Setup indexes for instant search
memberSchema.index({ fullName: 'text', memberId: 1, pin: 1, mobile: 1 });

const Member = mongoose.model('Member', memberSchema);
export default Member;
