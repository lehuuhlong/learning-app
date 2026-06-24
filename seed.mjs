/**
 * Database Seed Script for JLPT N2 Learning Platform
 *
 * Run: node seed.mjs
 *
 * Seeds 5 N2 vocabulary words and 2 N2 grammar points.
 * Idempotent — clears existing data before inserting.
 */

import mongoose from "mongoose";
import { config } from "dotenv";

// Load .env.local
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// --- Schemas (inline to keep seed self-contained) ---

const VocabularySchema = new mongoose.Schema(
  {
    kanji: { type: String, required: true, trim: true },
    hiragana: { type: String, required: true, trim: true },
    romaji: { type: String, required: true, trim: true, lowercase: true },
    meaning: { type: String, required: true, trim: true },
    jlptLevel: {
      type: String,
      enum: ["N1", "N2", "N3", "N4", "N5"],
      default: "N2",
    },
    exampleSentence: { type: String, default: "" },
    exampleMeaning: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const GrammarSchema = new mongoose.Schema(
  {
    pattern: { type: String, required: true, trim: true },
    meaning: { type: String, required: true, trim: true },
    jlptLevel: {
      type: String,
      enum: ["N1", "N2", "N3", "N4", "N5"],
      default: "N2",
    },
    structure: { type: String, required: true, trim: true },
    exampleSentence: { type: String, default: "" },
    exampleMeaning: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const Vocabulary =
  mongoose.models.Vocabulary ||
  mongoose.model("Vocabulary", VocabularySchema);
const Grammar =
  mongoose.models.Grammar || mongoose.model("Grammar", GrammarSchema);

// --- Seed Data ---

const vocabularyData = [
  {
    kanji: "影響",
    hiragana: "えいきょう",
    romaji: "eikyou",
    meaning: "influence; effect; impact",
    jlptLevel: "N2",
    exampleSentence: "この決定は私たちの生活に大きな影響を与えるだろう。",
    exampleMeaning:
      "This decision will probably have a big impact on our lives.",
    tags: ["noun", "suru-verb", "formal"],
  },
  {
    kanji: "経験",
    hiragana: "けいけん",
    romaji: "keiken",
    meaning: "experience",
    jlptLevel: "N2",
    exampleSentence: "海外で働いた経験がありますか。",
    exampleMeaning: "Do you have experience working abroad?",
    tags: ["noun", "suru-verb", "business"],
  },
  {
    kanji: "相変わらず",
    hiragana: "あいかわらず",
    romaji: "aikawarazu",
    meaning: "as usual; as always; same as ever",
    jlptLevel: "N2",
    exampleSentence: "彼は相変わらず元気だ。",
    exampleMeaning: "He is as energetic as ever.",
    tags: ["adverb", "conversational"],
  },
  {
    kanji: "届ける",
    hiragana: "とどける",
    romaji: "todokeru",
    meaning: "to deliver; to report; to notify",
    jlptLevel: "N2",
    exampleSentence: "荷物を友達の家に届けた。",
    exampleMeaning: "I delivered the package to my friend's house.",
    tags: ["ichidan-verb", "transitive"],
  },
  {
    kanji: "複雑",
    hiragana: "ふくざつ",
    romaji: "fukuzatsu",
    meaning: "complicated; complex; intricate",
    jlptLevel: "N2",
    exampleSentence: "この問題はとても複雑で、簡単には解決できない。",
    exampleMeaning:
      "This problem is very complicated and cannot be easily solved.",
    tags: ["na-adjective", "formal"],
  },
];

const grammarData = [
  {
    pattern: "～にとって",
    meaning: "for ~; from the perspective of ~; as far as ~ is concerned",
    jlptLevel: "N2",
    structure: "Noun + にとって（は / の）",
    exampleSentence: "学生にとって、この試験はとても大切です。",
    exampleMeaning: "For students, this exam is very important.",
    notes:
      "Used to express a standpoint or perspective. Often followed by は for emphasis or の when modifying a noun. Different from ～に対して which indicates direction/target rather than perspective.",
  },
  {
    pattern: "～わけがない",
    meaning:
      "there is no way that ~; it is impossible that ~; ~ cannot be the case",
    jlptLevel: "N2",
    structure:
      "Verb (plain form) + わけがない / い-Adj + わけがない / な-Adj + な + わけがない / Noun + の/な + わけがない",
    exampleSentence: "彼がそんなことを言うわけがない。",
    exampleMeaning: "There is no way he would say something like that.",
    notes:
      "Expresses strong conviction that something is impossible or unreasonable. Stronger than ～はずがない. In casual speech, often contracted to ～わけない. The polite form is ～わけがありません.",
  },
];

// --- Seeding Logic ---

async function seed() {
  console.log("🌱 Connecting to MongoDB...");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing vocabulary and grammar data...");
    await Vocabulary.deleteMany({});
    await Grammar.deleteMany({});

    // Insert vocabulary
    console.log("📝 Inserting 5 N2 vocabulary words...");
    const insertedVocab = await Vocabulary.insertMany(vocabularyData);
    insertedVocab.forEach((v) => {
      console.log(`   ✓ ${v.kanji} (${v.hiragana}) — ${v.meaning}`);
    });

    // Insert grammar
    console.log("📖 Inserting 2 N2 grammar points...");
    const insertedGrammar = await Grammar.insertMany(grammarData);
    insertedGrammar.forEach((g) => {
      console.log(`   ✓ ${g.pattern} — ${g.meaning}`);
    });

    console.log("\n🎉 Seeding complete!");
    console.log(`   Vocabulary: ${insertedVocab.length} words`);
    console.log(`   Grammar: ${insertedGrammar.length} points`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();
