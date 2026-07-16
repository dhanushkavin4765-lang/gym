import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  salary: {
    type: Number,
    required: true,
    min: 0,
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Full Time'],
    default: 'Morning',
  },
  photo: {
    type: String, // Base64 or local filepath
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

const Trainer = mongoose.model('Trainer', trainerSchema);
export default Trainer;
