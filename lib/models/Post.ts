import mongoose, { Schema, Document, models, model } from 'mongoose';

import type { IPost } from '@/types';
export type { IPost };

const PostSchema = new Schema<IPost>({
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String },
  mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },
}, { timestamps: true });

export default models.Post || model<IPost>('Post', PostSchema);
