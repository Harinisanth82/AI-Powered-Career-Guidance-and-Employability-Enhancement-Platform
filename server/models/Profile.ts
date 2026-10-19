import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: string;
  name: string;
  email: string;
  target_career: string;
  education_level: string;
  institution: string;
  cgpa: number;
  certifications_count: number;
  skills: Record<string, number>;
  interests: string;
  work_style: string;
  career_values: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: 'Alex Mercer',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    target_career: {
      type: String,
      default: 'Full Stack Developer',
    },
    education_level: {
      type: String,
      default: 'Undergraduate B.Tech Computer Science',
    },
    institution: {
      type: String,
      default: 'University Institute of Technology',
    },
    cgpa: {
      type: Number,
      default: 8.4,
    },
    certifications_count: {
      type: Number,
      default: 2,
    },
    skills: {
      type: Map,
      of: Number,
      default: {
        javascript: 8,
        react: 8,
        nodejs: 6,
        sql: 7,
        mongodb: 6,
        python: 5,
        git: 7,
        docker: 4,
        machine_learning: 4,
        problem_solving: 8,
        communication: 8,
      },
    },
    interests: {
      type: String,
      default: 'Web Development',
    },
    work_style: {
      type: String,
      default: 'Collaborative Teamwork',
    },
    career_values: {
      type: String,
      default: 'Continuous Learning & Growth',
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
