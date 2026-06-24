import { NextRequest } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Vocabulary from "@/models/Vocabulary";
import Progress from "@/models/Progress";

// A comprehensive mapping utility to convert Hiragana/Katakana to Romaji
function toRomaji(kana: string): string {
  const romajiMap: Record<string, string> = {
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

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level") || "N2";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const filter: any = {};
    const conditions: any[] = [];

    if (level && level !== "all") {
      conditions.push({
        $or: [
          { level: level },
          { jlptLevel: level }
        ]
      });
    }

    if (search) {
      conditions.push({
        $or: [
          { word: { $regex: search, $options: "i" } },
          { kanji: { $regex: search, $options: "i" } },
          { reading: { $regex: search, $options: "i" } },
          { hiragana: { $regex: search, $options: "i" } },
          { meaning: { $regex: search, $options: "i" } },
        ]
      });
    }

    if (conditions.length > 0) {
      filter.$and = conditions;
    }

    const [vocabulary, total] = await Promise.all([
      Vocabulary.find(filter).skip(skip).limit(limit).sort({ word: 1, kanji: 1 }),
      Vocabulary.countDocuments(filter),
    ]);

    // Format all items consistently for the frontend FlashCard component expectations
    const formattedVocabulary = vocabulary.map((v: any) => {
      const wordVal = v.word || v.kanji || "";
      const readingVal = v.reading || v.hiragana || "";
      
      let romajiVal = v.romaji || "";
      if (!romajiVal && readingVal) {
        romajiVal = toRomaji(readingVal);
      }

      return {
        _id: v._id.toString(),
        kanji: wordVal,
        hiragana: readingVal,
        romaji: romajiVal,
        meaning: v.meaning || "",
        jlptLevel: v.level || v.jlptLevel || "N2",
        exampleSentence: v.exampleSentence || "",
        exampleMeaning: v.exampleMeaning || "",
        tags: v.tags || []
      };
    });

    return Response.json({
      vocabulary: formattedVocabulary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Vocabulary fetch error:", error);
    return Response.json(
      { error: "Failed to fetch vocabulary" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vocabId, status } = await request.json();
    if (!vocabId) {
      return Response.json({ error: "vocabId is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Find the vocabulary item
    const vocab = await Vocabulary.findById(vocabId);
    if (!vocab) {
      return Response.json({ error: "Vocabulary not found" }, { status: 404 });
    }

    const level = vocab.level || (vocab as any).jlptLevel || "N2";

    // 1. Update/Upsert the Progress collection
    const targetStatus = status || "learned";
    await Progress.findOneAndUpdate(
      { userId: user._id, vocabId: vocab._id },
      { 
        status: targetStatus,
        level: level
      },
      { upsert: true, new: true }
    );

    // 2. Update User.progress.vocabLearned
    if (targetStatus === "learned") {
      if (!user.progress.vocabLearned.includes(vocab._id as any)) {
        user.progress.vocabLearned.push(vocab._id as any);
        await user.save();
      }
    } else {
      user.progress.vocabLearned = user.progress.vocabLearned.filter(
        (id) => id.toString() !== vocab._id.toString()
      );
      await user.save();
    }

    return Response.json({ success: true, status: targetStatus });
  } catch (error: any) {
    console.error("Vocabulary progress update error:", error);
    return Response.json(
      { error: error.message || "Failed to update progress" },
      { status: 500 }
    );
  }
}
