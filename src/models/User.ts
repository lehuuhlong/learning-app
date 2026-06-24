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
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development (HMR)
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
