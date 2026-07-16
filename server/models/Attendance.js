import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  date: {
    type: String, // format: YYYY-MM-DD to simplify index checks
    required: true,
  },
  checkInTime: {
    type: String, // format: HH:MM:SS
    required: true,
  },
  workout: {
    type: String,
    enum: ['Chest', 'Back', 'Legs', 'Shoulder', 'Biceps', 'Triceps', 'Cardio', 'Full Body', 'Custom Workout', 'None'],
    default: 'None',
  },
  customWorkout: {
    type: String,
    trim: true,
    default: '',
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate attendance on the same day
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
