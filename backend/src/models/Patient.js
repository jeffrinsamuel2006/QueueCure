import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true, unique: true, index: true },
    patientName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'served', 'cancelled'],
      default: 'waiting',
      index: true
    },
    createdAt: { type: Date, default: Date.now },
    servedAt: { type: Date, default: null },
    consultationDurationMinutes: { type: Number, default: null }
  },
  { versionKey: false }
);

export const Patient = mongoose.model('Patient', patientSchema);
