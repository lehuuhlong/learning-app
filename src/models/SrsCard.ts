import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISrsCard extends Document {
  userId: mongoose.Types.ObjectId;
  vocabId: mongoose.Types.ObjectId;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate: Date | null;
  quality: number;
  createdAt: Date;
  updatedAt: Date;
}

const SrsCardSchema = new Schema<ISrsCard>(
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
    easeFactor: {
      type: Number,
      default: 2.5, // SM-2 starting E-Factor
      min: 1.3,
    },
    interval: {
      type: Number,
      default: 0, // Days until next review
    },
    repetitions: {
      type: Number,
      default: 0, // Consecutive successful reviews
    },
    nextReviewDate: {
      type: Date,
      default: Date.now, // Immediately due on creation
    },
    lastReviewDate: {
      type: Date,
      default: null,
    },
    quality: {
      type: Number,
      default: 0, // Last quality rating (0-5)
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one SRS card per user per vocab word
SrsCardSchema.index({ userId: 1, vocabId: 1 }, { unique: true });

// Query optimization: find due cards for a user
SrsCardSchema.index({ userId: 1, nextReviewDate: 1 });

const SrsCard: Model<ISrsCard> =
  mongoose.models.SrsCard || mongoose.model<ISrsCard>("SrsCard", SrsCardSchema);

export default SrsCard;
