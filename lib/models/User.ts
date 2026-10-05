import mongoose, { Schema, Document, models, model } from 'mongoose';

import type { IUser, UserRole, ApplicationStatus } from '@/types';
export type { IUser, UserRole, ApplicationStatus };

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  role: { type: String, enum: ['user', 'volunteer', 'doctor', 'admin'], default: 'user' },
  isBanned: { type: Boolean, default: false },
  banCount: { type: Number, default: 0 },
  warningCount: { type: Number, default: 0 },
  applicationStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },
  savedVolunteer: { type: String },
  volunteerProfile: {
    phoneNo: Schema.Types.Mixed,
    whyVolunteer: String,
    degree: String,
    experience: String,
    whatsappNumber: Schema.Types.Mixed,
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  doctorProfile: {
    phoneNo: Schema.Types.Mixed,
    whyDoctor: String,
    degree: String,
    licenseNumber: String,
    college: String,
    experience: String,
    whatsappNumber: Schema.Types.Mixed,
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

if (models.User) {
  delete models.User;
}
export default model<IUser>('User', UserSchema);
