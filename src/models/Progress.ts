import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  vocabId: mongoose.Types.ObjectId;
  status: "new" | "learned";
  score: number;
  level: "N1" | "N2" | "N3" | "N4" | "N5";
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vocabId: {
      type: Schema.Types.ObjectId,
      ref: "Vocabulary",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["new", "learned"],
      default: "new",
      index: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ["N1", "N2", "N3", "N4", "N5"],
      default: "N2",
      index: true,
    }
  },
  {
    timestamps: true,
  }
);

// Compound unique key ensures a user only has one progress record per vocabulary word
ProgressSchema.index({ userId: 1, vocabId: 1 }, { unique: true });

const Progress: Model<IProgress> =
  mongoose.models.Progress || mongoose.model<IProgress>("Progress", ProgressSchema);

export default Progress;
