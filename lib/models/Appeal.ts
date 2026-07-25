import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAppealMessage {
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  content: string;
  timestamp: Date;
}

export interface IAppeal extends Document {
  userId: string; // clerkId of banned volunteer/doctor
  userName: string;
  userRole: string;
  userEmail: string;
  messages: IAppealMessage[];
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const AppealMessageSchema = new Schema<IAppealMessage>({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AppealSchema = new Schema<IAppeal>({
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  userEmail: { type: String, required: true },
  messages: [AppealMessageSchema],
  status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default models.Appeal || model<IAppeal>('Appeal', AppealSchema);
