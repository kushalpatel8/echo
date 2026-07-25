import mongoose, { Schema, Document, models, model } from 'mongoose';

export type UserRole = 'user' | 'volunteer' | 'doctor' | 'admin';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  imageUrl: string;
  role: UserRole;
  isBanned: boolean;
  warningCount?: number;
  applicationStatus?: ApplicationStatus;
  volunteerProfile?: {
    phoneNo: string;
    whyVolunteer: string;
    degree?: string;
    experience?: string;
    whatsappNumber?: string;
    rating: number;
    totalRatings: number;
  };
  doctorProfile?: {
    phoneNo: string;
    whyDoctor: string;
    degree: string;
    experience: string;
    whatsappNumber?: string;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  role: { type: String, enum: ['user', 'volunteer', 'doctor', 'admin'], default: 'user' },
  isBanned: { type: Boolean, default: false },
  warningCount: { type: Number, default: 0 },
  applicationStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },
  volunteerProfile: {
    phoneNo: String,
    whyVolunteer: String,
    degree: String,
    experience: String,
    whatsappNumber: String,
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  doctorProfile: {
    phoneNo: String,
    whyDoctor: String,
    degree: String,
    experience: String,
    whatsappNumber: String,
  },
}, { timestamps: true });

if (models.User) {
  delete models.User;
}
export default model<IUser>('User', UserSchema);
