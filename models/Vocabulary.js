const mongoose = require("mongoose");

const VocabularySchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: [true, "Word (Kanji/Expression) is required"],
      trim: true,
    },
    reading: {
      type: String,
      required: [true, "Reading (Kana) is required"],
      trim: true,
    },
    meaning: {
      type: String,
      required: [true, "Meaning is required"],
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
  },
  {
    timestamps: true,
  }
);

// Optimize vocabulary searches with a text index on key fields
VocabularySchema.index({ word: "text", reading: "text", meaning: "text" });

const Vocabulary = mongoose.models.Vocabulary || mongoose.model("Vocabulary", VocabularySchema);

module.exports = Vocabulary;
