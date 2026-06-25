import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExplanation extends Document {
  questionId: string;
  questionText: string;
  correctAnswer: string;
  explanationData: {
    whyCorrect: string;
    whyWrong: string;
    nuance: string;
  };
  createdAt: Date;
}

const ExplanationSchema = new Schema<IExplanation>(
  {
    questionId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    explanationData: {
      whyCorrect: { type: String, required: true },
      whyWrong: { type: String, required: true },
      nuance: { type: String, required: true },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt timestamp for cache logs
  }
);

const Explanation: Model<IExplanation> =
  mongoose.models.Explanation || mongoose.model<IExplanation>("Explanation", ExplanationSchema);

export default Explanation;
