const mongoose = require("mongoose");

const VocabularySchema = new mongoose.Schema(
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
      required: [true, "Romaji translation is required"],
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

// Optimize vocabulary searches with a text index on key fields
VocabularySchema.index({ kanji: "text", hiragana: "text", meaning: "text" });

const Vocabulary = mongoose.models.Vocabulary || mongoose.model("Vocabulary", VocabularySchema);

module.exports = Vocabulary;
