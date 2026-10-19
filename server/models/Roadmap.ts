import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmap extends Document {
  userId: string;
  target_career: string;
  milestones: Array<any>;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapSchema = new Schema<IRoadmap>(
  {
    userId: { type: String, required: true, index: true },
    target_career: { type: String, required: true },
    milestones: { type: [Schema.Types.Mixed] as any, default: [] },
  },
  { timestamps: true }
);

export const Roadmap = mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
