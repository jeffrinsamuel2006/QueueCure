import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    averageConsultationTime: { type: Number, default: 8, min: 1 },
    doctorStatus: {
      type: String,
      enum: ['available', 'busy', 'break'],
      default: 'available'
    },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const Setting = mongoose.model('Setting', settingSchema);
