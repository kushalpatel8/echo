import mongoose, { Schema, Document, models, model } from 'mongoose';

import type { ISuggestion } from '@/types';
export type { ISuggestion };

const SuggestionSchema = new Schema<ISuggestion>({
  text: { type: String, required: true },
  role: { type: String, default: 'anonymous' },
  userId: { type: String },
  name: { type: String },
  email: { type: String },
}, { timestamps: true });

export default models.Suggestion || model<ISuggestion>('Suggestion', SuggestionSchema);
