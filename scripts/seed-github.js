const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Configure dotenv to read from .env.local in the root directory
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in .env.local");
  console.log("Please make sure you have created .env.local and configured MONGODB_URI.");
  process.exit(1);
}

// Mongoose Vocabulary Schema definition matching src/models/Vocabulary.ts
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
      index: true,
    },
    exampleSentence: { type: String, default: "" },
    exampleMeaning: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Vocabulary = mongoose.models.Vocabulary || mongoose.model("Vocabulary", VocabularySchema);

// Hiragana to Romaji conversion utility
function toRomaji(kana) {
  const romajiMap = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ぎゃ': 'gya', 'ぎゅ': 'kyu', 'ぎょ': 'gyo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo'
  };

  let result = "";
  let i = 0;
  while (i < kana.length) {
    if (i + 1 < kana.length) {
      const doubleChar = kana.substring(i, i + 2);
      if (romajiMap[doubleChar]) {
        result += romajiMap[doubleChar];
        i += 2;
        continue;
      }
    }
    const singleChar = kana[i];
    if (singleChar === "っ" || singleChar === "ッ") {
      if (i + 1 < kana.length) {
        const nextChar = kana[i + 1];
        const nextRomaji = romajiMap[nextChar] || (i + 2 < kana.length ? romajiMap[kana.substring(i + 1, i + 3)] : "");
        if (nextRomaji) {
          result += nextRomaji[0];
        }
      }
      i++;
      continue;
    }
    if (singleChar === "ー") {
      if (result.length > 0) {
        result += result[result.length - 1];
      }
      i++;
      continue;
    }
    result += romajiMap[singleChar] || singleChar;
    i++;
  }
  return result;
}

// Meaning translations lookup dictionary for common N2 words
const translations = {
  "影響": "influence; effect; impact",
  "経験": "experience",
  "相変わらず": "as usual; as always; same as ever",
  "届ける": "to deliver; to report; to notify",
  "複雑": "complicated; complex; intricate",
  "諦める": "to give up; to abandon",
  "与える": "to give; to present; to award",
  "危ない": "dangerous; critical; grave",
  "穏やか": "calm; gentle; quiet"
};

const PRIMARY_URL = "https://raw.githubusercontent.com/Bluskyo/JLPT_Vocabulary/master/N2.json";
const FALLBACK_URL = "https://raw.githubusercontent.com/Bluskyo/JLPT_Vocabulary/master/data/vocab/results/JLPT_vocab_ALL.json";
const LOCAL_BACKUP_PATH = path.join(__dirname, "n2_vocab_backup.json");

async function fetchN2Data() {
  console.log(`🌐 Fetching N2 vocabulary from primary GitHub URL: ${PRIMARY_URL}`);
  try {
    const response = await fetch(PRIMARY_URL);
    if (response.ok) {
      const data = await response.json();
      console.log("   ✓ Successfully fetched primary N2.json");
      return { source: "primary_remote", rawData: data };
    }
  } catch (err) {
    console.log("   ⚠️ Primary URL 404 or failed. Attempting fallback ALL JSON repository file...");
  }

  try {
    const response = await fetch(FALLBACK_URL);
    if (response.ok) {
      const data = await response.json();
      console.log("   ✓ Successfully fetched consolidated JLPT_vocab_ALL.json");
      return { source: "fallback_remote", rawData: data };
    }
  } catch (err) {
    console.log("   ⚠️ Fallback URL fetch failed. Checking local backup...");
  }

  if (fs.existsSync(LOCAL_BACKUP_PATH)) {
    console.log("   ✓ Reading from local backup file:", LOCAL_BACKUP_PATH);
    const rawContent = fs.readFileSync(LOCAL_BACKUP_PATH, "utf-8");
    return { source: "local_file", rawData: JSON.parse(rawContent) };
  }

  throw new Error("Could not fetch from remote URLs or find a local backup.");
}

function processData(source, rawData) {
  const vocabList = [];
  console.log("🛠️  Mapping and transforming raw JSON to Vocabulary schema...");

  if (source === "primary_remote") {
    // Expected structure: Array of { word/kanji, reading, meaning }
    const items = Array.isArray(rawData) ? rawData : Object.values(rawData);
    items.forEach((item) => {
      const kanji = item.word || item.kanji || "";
      const reading = item.reading || item.hiragana || "";
      if (!kanji || !reading) return;

      vocabList.push({
        kanji,
        hiragana: reading,
        romaji: toRomaji(reading),
        meaning: translations[kanji] || item.meaning || `Meaning of ${kanji} (JLPT N2)`,
        jlptLevel: "N2",
        exampleSentence: item.exampleSentence || "",
        exampleMeaning: item.exampleMeaning || "",
        tags: item.tags || ["N2", "vocabulary"]
      });
    });
  } else {
    // Structure of JLPT_vocab_ALL.json or local_backup is {"Kanji": [{reading: "...", level: 2}]}
    for (const [kanji, readings] of Object.entries(rawData)) {
      readings.forEach((entry) => {
        if (entry.level === 2) {
          vocabList.push({
            kanji,
            hiragana: entry.reading,
            romaji: toRomaji(entry.reading),
            meaning: translations[kanji] || `N2 Vocabulary: ${kanji} (${entry.reading})`,
            jlptLevel: "N2",
            exampleSentence: "",
            exampleMeaning: "",
            tags: ["N2", "vocabulary"]
          });
        }
      });
    }
  }

  return vocabList;
}

async function run() {
  try {
    const { source, rawData } = await fetchN2Data();
    const vocabList = processData(source, rawData);

    if (vocabList.length === 0) {
      console.warn("⚠️ Warning: Processed 0 words. Seeding aborted.");
      return;
    }

    console.log(`🔌 Mapped ${vocabList.length} N2 vocabulary words. Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Database connection established.");

    console.log("🗑️  Clearing existing N2 vocabulary from database...");
    const deleteResult = await Vocabulary.deleteMany({ jlptLevel: "N2" });
    console.log(`   ✓ Removed ${deleteResult.deletedCount} old N2 words.`);

    console.log("📝 Writing N2 vocabulary into database in chunks...");
    const chunkSize = 500;
    for (let i = 0; i < vocabList.length; i += chunkSize) {
      const chunk = vocabList.slice(i, i + chunkSize);
      await Vocabulary.insertMany(chunk);
      console.log(`   ✓ Wrote items ${i + 1} to ${Math.min(i + chunkSize, vocabList.length)}...`);
    }

    console.log(`\n🎉 Seeding successfully completed! Wrote ${vocabList.length} N2 vocabulary words.`);
  } catch (error) {
    console.error("❌ Seeding execution failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

run();
