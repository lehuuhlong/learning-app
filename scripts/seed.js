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

// Inline Schema definition matching src/models/Vocabulary.ts for full compatibility
const VocabularySchema = new mongoose.Schema(
  {
    kanji: {
      type: String,
      required: true,
      trim: true,
    },
    hiragana: {
      type: String,
      required: true,
      trim: true,
    },
    romaji: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    meaning: {
      type: String,
      required: true,
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

const Vocabulary = mongoose.models.Vocabulary || mongoose.model("Vocabulary", VocabularySchema);

// A comprehensive mapping utility to convert Hiragana/Katakana to Romaji
function toRomaji(kana) {
  const romajiMap = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'mi': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'de': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'にゃ': 'nya', 'niゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ぎゃ': 'gya', 'ぎゅ': 'kyu', 'ぎょ': 'gyo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
    // Katakana
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po'
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

// Predefined N2 translations to keep UI beautiful, mapping fallback templates for the rest
const translations = {
  "影響": "influence; effect; impact",
  "経験": "experience",
  "相変わらず": "as usual; as always; same as ever",
  "届ける": "to deliver; to report; to notify",
  "複雑": "complicated; complex; intricate",
  "諦める": "to give up; to abandon",
  "与える": "to give; to present; to award",
  "危ない": "dangerous; critical; grave",
  "誤る": "to make a mistake; to err",
  "争う": "to dispute; to argue; to contend",
  "現れる": "to appear; to come in sight",
  "表す": "to express; to represent",
  "慌てる": "to become confused; to panic",
  "痛む": "to hurt; to feel pain",
  "祈る": "to pray; to wish",
  "祝う": "to congratulate; to celebrate",
  "埋める": "to bury; to fill up",
  "疑う": "to doubt; to distrust; to suspect",
  "美しい": "beautiful; lovely",
  "奪う": "to snatch away; to dispossess",
  "うなずく": "to nod; to bow one's head",
  "裏切る": "to betray; to turn coat",
  "得る": "to get; to acquire; to earn",
  "選ぶ": "to choose; to select",
  "送る": "to send; to dispatch",
  "怒る": "to get angry; to be mad",
  "お互い": "mutual; reciprocal; each other",
  "恐れる": "to fear; to be afraid of",
  "穏やか": "calm; gentle; quiet"
};

const VOCAB_URL = "https://raw.githubusercontent.com/Bluskyo/JLPT_Vocabulary/master/data/vocab/results/JLPT_vocab_ALL.json";
const LOCAL_BACKUP_PATH = path.join(__dirname, "n2_vocab_backup.json");

async function fetchVocabularyData() {
  console.log(`🌐 Attempting to fetch full JLPT vocabulary (N1-N5)...`);
  try {
    const response = await fetch(VOCAB_URL);
    if (response.ok) {
      const data = await response.json();
      console.log("   ✓ Successfully fetched consolidated JLPT_vocab_ALL.json from GitHub");
      return { source: "remote", rawData: data };
    }
  } catch (err) {
    console.log("   ⚠️ Remote URL fetch failed. Checking local backup...");
  }

  // Local file fallback
  if (fs.existsSync(LOCAL_BACKUP_PATH)) {
    console.log("   ✓ Reading from local backup file:", LOCAL_BACKUP_PATH);
    const rawContent = fs.readFileSync(LOCAL_BACKUP_PATH, "utf-8");
    return { source: "local_file", rawData: JSON.parse(rawContent) };
  }

  throw new Error("Could not retrieve vocabulary data from remote server or local backup.");
}

function processData(source, rawData) {
  console.log("🛠️  Processing vocabulary data for N1 -> N5...");
  const processedWords = [];

  // Structure of JLPT_vocab_ALL.json is {"Kanji": [{reading: "...", level: 1}, ...]}
  for (const [kanji, readings] of Object.entries(rawData)) {
    readings.forEach((entry) => {
      const levelNum = entry.level; // e.g., 1, 2, 3, 4, 5
      if (levelNum >= 1 && levelNum <= 5) {
        const jlptLevel = `N${levelNum}`;
        processedWords.push({
          kanji: kanji,
          hiragana: entry.reading,
          romaji: toRomaji(entry.reading),
          meaning: translations[kanji] || `${jlptLevel} Vocabulary: ${kanji} (${entry.reading})`,
          jlptLevel: jlptLevel,
          exampleSentence: "",
          exampleMeaning: "",
          tags: [jlptLevel, "vocabulary"]
        });
      }
    });
  }

  // Backup remote data locally for future offline usage
  if (source === "remote") {
    try {
      fs.writeFileSync(LOCAL_BACKUP_PATH, JSON.stringify(rawData, null, 2));
      console.log("💾 Saved copy to local backup:", LOCAL_BACKUP_PATH);
    } catch (err) {
      console.warn("   ⚠️ Failed to save local cache file:", err.message);
    }
  }

  return processedWords;
}

async function run() {
  console.log("🚀 Starting JLPT N1-N5 Seeding script...");

  try {
    const { source, rawData } = await fetchVocabularyData();
    const vocabList = processData(source, rawData);

    if (vocabList.length === 0) {
      console.warn("⚠️ Warning: Mapped 0 vocabulary words. Aborting database writing.");
      return;
    }

    console.log(`🔌 Mapped ${vocabList.length} vocabulary items. Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Database connection established.");

    // Clear ALL vocabulary so we can cleanly populate N1-N5
    console.log("🗑️  Clearing all existing vocabulary from database...");
    const deleteResult = await Vocabulary.deleteMany({});
    console.log(`   ✓ Removed ${deleteResult.deletedCount} existing vocabulary words.`);

    // Batch insert
    console.log("📝 Writing N1-N5 vocabulary into database in chunks...");
    const chunkSize = 1000;
    for (let i = 0; i < vocabList.length; i += chunkSize) {
      const chunk = vocabList.slice(i, i + chunkSize);
      await Vocabulary.insertMany(chunk);
      console.log(`   ✓ Wrote items ${i + 1} to ${Math.min(i + chunkSize, vocabList.length)}...`);
    }

    // Count distributions per level
    const levelCounts = {};
    vocabList.forEach((w) => {
      levelCounts[w.jlptLevel] = (levelCounts[w.jlptLevel] || 0) + 1;
    });

    console.log("\n🎉 Seeding successfully completed!");
    console.log(`   Total Vocabulary: ${vocabList.length} words`);
    Object.entries(levelCounts).sort().forEach(([lvl, count]) => {
      console.log(`   - ${lvl}: ${count} words`);
    });
  } catch (error) {
    console.error("❌ Seeding execution failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

run();
