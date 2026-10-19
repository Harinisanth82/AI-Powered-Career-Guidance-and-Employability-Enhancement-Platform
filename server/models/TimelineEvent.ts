import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineEvent extends Document {
  userId: string;
  type: string;
  title: string;
  description: string;
  date: string;
  createdAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true }
);

export const TimelineEvent = mongoose.models.TimelineEvent || mongoose.model<ITimelineEvent>('TimelineEvent', TimelineEventSchema);
