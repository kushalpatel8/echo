import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  assignerId: string; // volunteer or doctor clerkId
  assignerName: string;
  assigneeId: string; // user clerkId
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignerId: { type: String, required: true },
  assignerName: { type: String, required: true },
  assigneeId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
}, { timestamps: true });

export default models.Task || model<ITask>('Task', TaskSchema);
