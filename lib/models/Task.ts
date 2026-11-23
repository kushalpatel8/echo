import mongoose, { Schema, Document, models, model } from 'mongoose';

import type { ITask } from '@/types';
export type { ITask };

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignerId: { type: String, required: true },
  assignerName: { type: String, required: true },
  assigneeId: { type: String, required: true },
  assigneeName: { type: String },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
}, { timestamps: true });

if (models.Task) {
  delete models.Task;
}

export default model<ITask>('Task', TaskSchema);
