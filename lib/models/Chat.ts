import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IMessage {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  participants: string[]; // clerkIds
  participantNames: string[];
  messages: IMessage[];
  isActive: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>({
  participants: [{ type: String }],
  participantNames: [{ type: String }],
  messages: [MessageSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default models.Chat || model<IChat>('Chat', ChatSchema);
