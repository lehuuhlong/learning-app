import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Vocabulary from "@/models/Vocabulary";

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
    if (level && level !== "all") {
      filter.jlptLevel = level;
    }

    if (search) {
      filter.$or = [
        { kanji: { $regex: search, $options: "i" } },
        { hiragana: { $regex: search, $options: "i" } },
        { meaning: { $regex: search, $options: "i" } },
      ];
    }

    const [vocabulary, total] = await Promise.all([
      Vocabulary.find(filter).skip(skip).limit(limit).sort({ kanji: 1 }),
      Vocabulary.countDocuments(filter),
    ]);

    return Response.json({
      vocabulary,
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
