import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVocabulary extends Document {
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  jlptLevel: "N1" | "N2" | "N3" | "N4" | "N5";
  exampleSentence: string;
  exampleMeaning: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VocabularySchema = new Schema<IVocabulary>(
  {
    kanji: {
      type: String,
      required: [true, "Kanji is required"],
      trim: true,
    },
    hiragana: {
      type: String,
      required: [true, "Hiragana reading is required"],
      trim: true,
    },
    romaji: {
      type: String,
      required: [true, "Romaji is required"],
      trim: true,
      lowercase: true,
    },
    meaning: {
      type: String,
      required: [true, "English meaning is required"],
      trim: true,
    },
    jlptLevel: {
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
VocabularySchema.index({ kanji: "text", hiragana: "text", meaning: "text" });

const Vocabulary: Model<IVocabulary> =
  mongoose.models.Vocabulary ||
  mongoose.model<IVocabulary>("Vocabulary", VocabularySchema);

export default Vocabulary;
