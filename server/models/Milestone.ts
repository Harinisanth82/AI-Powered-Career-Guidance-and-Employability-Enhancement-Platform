import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
  userId: string;
  milestoneId: string;
  career: string;
  phase: string;
  title: string;
  objective: string;
  skills: string[];
  estimatedHours: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  completedAt?: Date;
  task: Record<string, any>;
  learningResources: Array<any>;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    userId: { type: String, required: true, index: true },
    milestoneId: { type: String, required: true },
    career: { type: String, required: true },
    phase: { type: String, required: true },
    title: { type: String, required: true },
    objective: { type: String, default: '' },
    skills: { type: [String], default: [] },
    estimatedHours: { type: Number, default: 20 },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    completedAt: { type: Date },
    task: { type: Schema.Types.Mixed as any, default: {} },
    learningResources: { type: [Schema.Types.Mixed] as any, default: [] },
  },
  { timestamps: true }
);

export const Milestone = mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', MilestoneSchema);
