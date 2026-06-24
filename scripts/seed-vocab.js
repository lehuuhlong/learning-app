const mongoose = require("mongoose");
const https = require("https");
const csv = require("csv-parser");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in environment variables.");
  process.exit(1);
}

// Inline schema definition to keep the script self-contained and compatible
const VocabularySchema = new mongoose.Schema(
  {
    word: { type: String, required: true, trim: true },
    reading: { type: String, required: true, trim: true },
    meaning: { type: String, required: true, trim: true },
    part_of_speech: { type: [String], default: [] },
    level: { type: String, default: "N2" }
  },
  { timestamps: true }
);

const Vocabulary = mongoose.models.Vocabulary || mongoose.model("Vocabulary", VocabularySchema);

const N2_CSV_URL = "https://raw.githubusercontent.com/elzup/jlpt-word-list/master/src/n2.csv";

async function seed() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB.");

    console.log("🗑️ Clearing existing N2 vocabulary...");
    // Clear N2 words that have either level: "N2" or jlptLevel: "N2"
    const deleteResult = await Vocabulary.deleteMany({
      $or: [{ level: "N2" }, { jlptLevel: "N2" }]
    });
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing N2 vocabulary words.`);

    console.log(`⏳ Fetching CSV from ${N2_CSV_URL}...`);
    const results = [];

    https.get(N2_CSV_URL, (res) => {
      if (res.statusCode !== 200) {
        console.error(`❌ Failed to fetch CSV. Status Code: ${res.statusCode}`);
        process.exit(1);
      }

      res.pipe(csv())
        .on("data", (data) => {
          // Map expression -> word, reading -> reading, meaning -> meaning, tags -> part_of_speech
          results.push({
            word: data.expression || "",
            reading: data.reading || "",
            meaning: data.meaning || "",
            part_of_speech: data.tags ? data.tags.split(" ").filter(Boolean) : [],
            level: "N2"
          });
        })
        .on("end", async () => {
          console.log(`✅ Parsed ${results.length} words from CSV.`);
          if (results.length === 0) {
            console.log("⚠️ No data to insert.");
            process.exit(0);
          }

          console.log("⏳ Seeding into MongoDB...");
          const batchSize = 500;
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            await Vocabulary.insertMany(batch);
            console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} items)`);
          }

          console.log("🎉 Seeding completed successfully!");
          await mongoose.disconnect();
          process.exit(0);
        })
        .on("error", (err) => {
          console.error("❌ Error reading stream:", err);
          process.exit(1);
        });
    });
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
