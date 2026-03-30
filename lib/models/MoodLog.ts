import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IMoodLog extends Document {
  userId: string;
  answers: Record<string, number | string>;
  detectedMood: string;
  moodScore: number;
  createdAt: Date;
}

const MoodLogSchema = new Schema<IMoodLog>({
  userId: { type: String, required: true },
  answers: { type: Schema.Types.Mixed, required: true },
  detectedMood: { type: String, required: true },
  moodScore: { type: Number, required: true },
}, { timestamps: true });

export default models.MoodLog || model<IMoodLog>('MoodLog', MoodLogSchema);
