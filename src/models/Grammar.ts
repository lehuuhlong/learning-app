import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGrammar extends Document {
  level: "N1" | "N2" | "N3" | "N4" | "N5";
  structure: string;
  meaning: string;
  formation: string;
  examples: {
    japanese: string;
    romaji: string;
    vietnamese: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const GrammarSchema = new Schema<IGrammar>(
  {
    level: {
      type: String,
      enum: ["N1", "N2", "N3", "N4", "N5"],
      required: [true, "Level is required"],
      index: true,
    },
    structure: {
      type: String,
      required: [true, "Structure is required"],
      trim: true,
    },
    meaning: {
      type: String,
      required: [true, "Meaning is required"],
      trim: true,
    },
    formation: {
      type: String,
      required: [true, "Formation is required"],
      trim: true,
    },
    examples: [
      {
        japanese: { type: String, required: true },
        romaji: { type: String, required: true },
        vietnamese: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Grammar: Model<IGrammar> =
  mongoose.models.Grammar || mongoose.model<IGrammar>("Grammar", GrammarSchema);

export default Grammar;
