import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVocabulary extends Document {
  word: string;
  reading: string;
  meaning: string;
  part_of_speech: string[];
  level: "N1" | "N2" | "N3" | "N4" | "N5";
  exampleSentence?: string;
  exampleMeaning?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VocabularySchema = new Schema<IVocabulary>(
  {
    word: {
      type: String,
      required: [true, "Word is required"],
      trim: true,
    },
    reading: {
      type: String,
      required: [true, "Reading is required"],
      trim: true,
    },
    meaning: {
      type: String,
      required: [true, "English meaning is required"],
      trim: true,
    },
    part_of_speech: {
      type: [String],
      default: [],
    },
    level: {
      type: String,
      enum: ["N1", "N2", "N3", "N4", "N5"],
      default: "N2",
      index: true,
    },
    exampleSentence: {
      type: String,
      default: "",
    },
    exampleMeaning: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
VocabularySchema.index({ word: "text", reading: "text", meaning: "text" });

const Vocabulary: Model<IVocabulary> =
  mongoose.models.Vocabulary ||
  mongoose.model<IVocabulary>("Vocabulary", VocabularySchema);

export default Vocabulary;
