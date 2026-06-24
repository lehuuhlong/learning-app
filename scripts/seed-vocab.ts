import mongoose from "mongoose";
import https from "https";
import csv from "csv-parser";
import dotenv from "dotenv";
import Vocabulary from "../src/models/Vocabulary";
import path from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

const N2_CSV_URL = "https://raw.githubusercontent.com/elzup/jlpt-word-list/master/src/n2.csv";

interface CSVRow {
  expression: string;
  reading: string;
  meaning: string;
  tags: string;
}

async function seedVocabulary() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Connected to MongoDB.");

    console.log("🗑️ Clearing existing N2 vocabulary...");
    await Vocabulary.deleteMany({ level: "N2" });
    console.log("✅ Cleared existing N2 vocabulary.");

    console.log(`⏳ Fetching CSV from ${N2_CSV_URL}...`);
    
    const results: any[] = [];
    
    https.get(N2_CSV_URL, (response) => {
      if (response.statusCode !== 200) {
        console.error(`❌ Failed to fetch CSV. Status Code: ${response.statusCode}`);
        process.exit(1);
      }

      response
        .pipe(csv())
        .on("data", (data: CSVRow) => {
          // Parse the tags to check for jlpt_2 and extract POS if possible
          // elzup data tags look like "JLPT JLPT_2"
          
          results.push({
            word: data.expression,
            reading: data.reading,
            meaning: data.meaning,
            part_of_speech: [], // The CSV doesn't provide explicit parts of speech easily
            level: "N2",
          });
        })
        .on("end", async () => {
          console.log(`✅ Parsed ${results.length} words from CSV.`);
          
          if (results.length === 0) {
            console.log("⚠️ No data to insert.");
            process.exit(0);
          }

          console.log("⏳ Seeding into MongoDB...");
          // Insert in batches of 500 to avoid memory issues
          const batchSize = 500;
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            await Vocabulary.insertMany(batch);
            console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} items)`);
          }

          console.log("🎉 Seeding completed successfully!");
          mongoose.disconnect();
          process.exit(0);
        })
        .on("error", (error) => {
          console.error("❌ Error parsing CSV:", error);
          process.exit(1);
        });
    });

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    mongoose.disconnect();
    process.exit(1);
  }
}

seedVocabulary();
