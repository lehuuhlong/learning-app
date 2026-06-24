import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGrammar extends Document {
  pattern: string;
  meaning: string;
  jlptLevel: "N1" | "N2" | "N3" | "N4" | "N5";
  structure: string;
  exampleSentence: string;
  exampleMeaning: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const GrammarSchema = new Schema<IGrammar>(
  {
    pattern: {
      type: String,
      required: [true, "Grammar pattern is required"],
      trim: true,
    },
    meaning: {
      type: String,
      required: [true, "Meaning is required"],
      trim: true,
    },
    jlptLevel: {
      type: String,
      enum: ["N1", "N2", "N3", "N4", "N5"],
      default: "N2",
      index: true,
    },
    structure: {
      type: String,
      required: [true, "Structure/formation rule is required"],
      trim: true,
    },
    exampleSentence: {
      type: String,
      default: "",
    },
    exampleMeaning: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

GrammarSchema.index({ pattern: "text", meaning: "text" });

const Grammar: Model<IGrammar> =
  mongoose.models.Grammar ||
  mongoose.model<IGrammar>("Grammar", GrammarSchema);

export default Grammar;
