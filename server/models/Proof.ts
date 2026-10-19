import mongoose, { Schema, Document } from 'mongoose';

export interface IProof extends Document {
  userId: string;
  title: string;
  type: string;
  url: string;
  verified: boolean;
  badge: string;
  date: string;
  skills_verified: string[];
  verification_checks: string[];
  createdAt: Date;
}

const ProofSchema = new Schema<IProof>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    verified: { type: Boolean, default: true },
    badge: { type: String, default: 'Verified Implementation' },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    skills_verified: { type: [String], default: [] },
    verification_checks: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Proof = mongoose.models.Proof || mongoose.model<IProof>('Proof', ProofSchema);
