import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  userId: string;
  inputs: Record<string, any>;
  top_career: string;
  recommendations: Array<any>;
  model_used: string;
  model_accuracy: number;
  createdAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: { type: String, required: true, index: true },
    inputs: { type: Schema.Types.Mixed as any, required: true },
    top_career: { type: String, required: true },
    recommendations: { type: [Schema.Types.Mixed] as any, default: [] },
    model_used: { type: String, default: 'Logistic Regression' },
    model_accuracy: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const Assessment = mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
