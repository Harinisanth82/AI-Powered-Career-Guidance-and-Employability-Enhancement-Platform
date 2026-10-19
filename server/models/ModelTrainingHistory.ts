import mongoose, { Schema, Document } from 'mongoose';

export interface IModelTrainingHistory extends Document {
  modelName: string;
  datasetName: string;
  targetColumn: string;
  accuracy: number;
  f1Score: number;
  classesCount: number;
  classes: string[];
  parameters: Record<string, any>;
  trainedBy?: string;
  createdAt: Date;
}

const ModelTrainingHistorySchema = new Schema<IModelTrainingHistory>(
  {
    modelName: { type: String, required: true },
    datasetName: { type: String, required: true },
    targetColumn: { type: String, default: 'Career' },
    accuracy: { type: Number, required: true },
    f1Score: { type: Number, required: true },
    classesCount: { type: Number, default: 0 },
    classes: { type: [String], default: [] },
    parameters: { type: Schema.Types.Mixed, default: {} },
    trainedBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

export const ModelTrainingHistory =
  mongoose.models.ModelTrainingHistory ||
  mongoose.model<IModelTrainingHistory>('ModelTrainingHistory', ModelTrainingHistorySchema);
