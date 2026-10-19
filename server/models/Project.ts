import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: string;
  projectId: string;
  title: string;
  career: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Available' | 'In Progress' | 'Completed';
  skillsDeveloped: string[];
  estimatedHours: number;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  milestones: string[];
  deliverables: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    career: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    status: {
      type: String,
      enum: ['Available', 'In Progress', 'Completed'],
      default: 'Available',
    },
    skillsDeveloped: { type: [String], default: [] },
    estimatedHours: { type: Number, default: 30 },
    description: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    milestones: { type: [String], default: [] },
    deliverables: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
