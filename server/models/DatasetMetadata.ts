import mongoose, { Schema, Document } from 'mongoose';

export interface IDatasetMetadata extends Document {
  filename: string;
  totalRows: number;
  totalColumns: number;
  targetColumn: string;
  columns: Array<any>;
  duplicateRows: number;
  uploadedBy?: string;
  createdAt: Date;
}

const DatasetMetadataSchema = new Schema<IDatasetMetadata>(
  {
    filename: { type: String, required: true },
    totalRows: { type: Number, required: true },
    totalColumns: { type: Number, required: true },
    targetColumn: { type: String, default: 'Career' },
    columns: { type: [Schema.Types.Mixed] as any, default: [] },
    duplicateRows: { type: Number, default: 0 },
    uploadedBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

export const DatasetMetadata = mongoose.models.DatasetMetadata || mongoose.model<IDatasetMetadata>('DatasetMetadata', DatasetMetadataSchema);
