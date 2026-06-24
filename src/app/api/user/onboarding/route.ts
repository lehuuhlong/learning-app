import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Check session authentication
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetLevel } = await request.json();
    
    // Validate target level selection
    const validLevels = ["N1", "N2", "N3", "N4", "N5"];
    if (!targetLevel || !validLevels.includes(targetLevel)) {
      return NextResponse.json(
        { error: "Invalid target level selection. Must be N1, N2, N3, N4, or N5." },
        { status: 400 }
      );
    }

    // Find and update user onboarding flags
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        targetLevel,
        isFirstLogin: false 
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, targetLevel: user.targetLevel });
  } catch (error: any) {
    console.error("Onboarding API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update onboarding info" }, { status: 500 });
  }
}
