import mongoose, { Schema, Model, Types, Document } from "mongoose";
const contentTypes = ["image", "video", "article", "audio"];
export interface IContent extends Document {
  link: string;
  title: string;
  type: "image" | "video" | "article" | "audio" | "document" | "tweet";
  tags: Types.ObjectId[];
  userId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContentSchema: Schema<IContent> = new Schema(
  {
    link: { type: String },
    title: { type: String },
    type: {
      type: String,
      enum: ["image", "video", "article", "audio", "document", "tweet"],
      required: true,
    },
    tags: [{ type: Types.ObjectId, ref: "Tag" }],
    userId: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Content: Model<IContent> = mongoose.model<IContent>(
  "Content",
  ContentSchema
);
