import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  userId: string;
  skillId: string;
  name: string;
  category: string;
  proficiencyLevel: number; // 1-10
  status: 'Mastered' | 'Developing' | 'Underdeveloped';
  targetCareers: string[];
  lastAssessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    userId: { type: String, required: true, index: true },
    skillId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    proficiencyLevel: { type: Number, required: true, min: 1, max: 10 },
    status: {
      type: String,
      enum: ['Mastered', 'Developing', 'Underdeveloped'],
      default: 'Developing',
    },
    targetCareers: { type: [String], default: [] },
    lastAssessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Skill = mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);
