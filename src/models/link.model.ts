import mongoose, { Schema, Types, Model } from "mongoose";
export interface ILink extends Document {
  hash: string;
  userId?: Types.ObjectId;
}

const LinkSchema: Schema<ILink> = new Schema(
  {
    hash: { type: String, required: true },
    userId: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Link: Model<ILink> = mongoose.model<ILink>("Link", LinkSchema);
