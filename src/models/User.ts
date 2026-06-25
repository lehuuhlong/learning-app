import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider: "google" | "credentials";
  progress: {
    vocabLearned: mongoose.Types.ObjectId[];
    quizScores: {
      score: number;
      total: number;
      date: Date;
      type: string;
    }[];
  };
  targetLevel?: "N1" | "N2" | "N3" | "N4" | "N5" | null;
  isFirstLogin?: boolean;
  learningHistory?: {
    date: Date;
    activityType: "vocabulary" | "grammar" | "dokkai";
    score: number;
    timeSpent: number;
  }[];
  gamification?: {
    exp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
    badges: string[];
    flashcardsToday: number;
    flashcardsTodayDate: string | null;
  };
  createdAt: Date;
  updatedAt: Date;

}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      select: false, // Don't include password in queries by default
    },
    image: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["google", "credentials"],
      default: "credentials",
    },
    progress: {
      vocabLearned: [
        {
          type: Schema.Types.ObjectId,
          ref: "Vocabulary",
        },
      ],
      quizScores: [
        {
          score: { type: Number, required: true },
          total: { type: Number, required: true },
          date: { type: Date, default: Date.now },
          type: { type: String, default: "vocabulary" },
        },
      ],
    },
    targetLevel: {
      type: String,
      enum: ["N1", "N2", "N3", "N4", "N5", null],
      default: null,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    learningHistory: [
      {
        date: { type: Date, default: Date.now },
        activityType: { type: String, enum: ["vocabulary", "grammar", "dokkai"], required: true },
        score: { type: Number, required: true },
        timeSpent: { type: Number, required: true },
      },
    ],
    gamification: {
      exp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActiveDate: { type: String, default: null },
      badges: { type: [String], default: [] },
      flashcardsToday: { type: Number, default: 0 },
      flashcardsTodayDate: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development (HMR)
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
