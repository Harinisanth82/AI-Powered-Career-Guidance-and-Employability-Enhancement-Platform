import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeAnalysis extends Document {
  userId: string;
  filename: string;
  target_career: string;
  detected_skills_count: number;
  skill_coverage_percentage: number;
  matched_skills: Array<any>;
  missing_skills: Array<any>;
  extracted_education: string[];
  extracted_certifications: string[];
  extracted_projects: string[];
  extracted_experience: string;
  career_rankings: Array<any>;
  createdAt: Date;
}

const ResumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    target_career: { type: String, required: true },
    detected_skills_count: { type: Number, default: 0 },
    skill_coverage_percentage: { type: Number, default: 0 },
    matched_skills: { type: [Schema.Types.Mixed] as any, default: [] },
    missing_skills: { type: [Schema.Types.Mixed] as any, default: [] },
    extracted_education: { type: [String], default: [] },
    extracted_certifications: { type: [String], default: [] },
    extracted_projects: { type: [String], default: [] },
    extracted_experience: { type: String, default: '' },
    career_rankings: { type: [Schema.Types.Mixed] as any, default: [] },
  },
  { timestamps: true }
);

export const ResumeAnalysis = mongoose.models.ResumeAnalysis || mongoose.model<IResumeAnalysis>('ResumeAnalysis', ResumeAnalysisSchema);
