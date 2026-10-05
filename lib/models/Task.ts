import mongoose, { Schema, Document, models, model } from 'mongoose';

import type { ITask } from '@/types';
export type { ITask };

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignerId: { type: String, required: true },
  assignerName: { type: String, required: true },
  assigneeId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
}, { timestamps: true });

export default models.Task || model<ITask>('Task', TaskSchema);
