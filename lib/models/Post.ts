import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IPost extends Document {
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  createdAt: Date;
}

const PostSchema = new Schema<IPost>({
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String },
  mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },
}, { timestamps: true });

export default models.Post || model<IPost>('Post', PostSchema);
