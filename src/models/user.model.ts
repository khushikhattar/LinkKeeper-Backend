import mongoose, { Schema, Model, Types, Document } from "mongoose";
import bcrypt from "bcryptjs";
import ms from "ms";
import jwt from "jsonwebtoken";
import { IContent } from "./content.model";
interface IUser extends Document {
  _id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
  content: Array<IContent>;
  genAccessToken: () => string;
  genRefreshToken: () => string;
  isPasswordCorrect: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: { type: String, required: true },
    refreshToken: { type: String },
    content: [{ type: Types.ObjectId, ref: "Content" }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

UserSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};
UserSchema.methods.genAccessToken = function (): string {
  return jwt.sign(
    { _id: this._id, username: this.username, email: this.email },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue }
  );
};

UserSchema.methods.genRefreshToken = function (): string {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue }
  );
};

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
