import mongoose, { Schema, Types, Model, Document } from "mongoose";

export interface ITag extends Document {
  title: string;
  userId: Types.ObjectId;
}

const TagSchema: Schema<ITag> = new Schema(
  {
    title: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Tag: Model<ITag> = mongoose.model<ITag>("Tag", TagSchema);
