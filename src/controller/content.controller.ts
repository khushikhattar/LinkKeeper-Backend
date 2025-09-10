import { Request, Response } from "express";
import { Content } from "../models/content.model";
import { User } from "../models/user.model";
import z from "zod";
import { generateNanoId } from "../utils/helper";
import { Link } from "../models/link.model";
// Schema to validate adding new content
const addSchema = z.object({
  link: z.string(),
  title: z.string(),
  type: z.enum(["image", "video", "article", "audio", "document", "tweet"]),
});
type add = z.infer<typeof addSchema>;

// Controller to add new content for the authenticated user
const AddContent = async (req: Request, res: Response) => {
  const parsedData = addSchema.safeParse(req.body);
  console.log("Parsed Data:", parsedData);
  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: "Validation Errors", error: parsedData.error.issues });
    return;
  }
  console.log("Parsed Data:", parsedData);
  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized Request" });
    return;
  }

  try {
    const data: add = parsedData.data;
    // Create new content document with user reference
    const createContent = await Content.create({
      link: data.link,
      title: data.title,
      type: data.type,
      userId: req.user._id, // associate content with the user
    });

    // Update user's content array to include this new content
    await User.findByIdAndUpdate(req.user._id, {
      $push: { content: createContent._id },
    });

    res.status(201).json({
      message: "Content created successfully",
      content: createContent,
    });
  } catch (err) {
    console.log("Error in creating the content", err);
    res.status(500).json({ message: "Error in creating the content" });
    return;
  }
};

// Controller to delete content by ID for authenticated user
const DeleteContent = async (req: Request, res: Response) => {
  const deleteId = req.params.id;

  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized Request" });
    return;
  }

  try {
    // Remove content document owned by the user
    const deletedContent = await Content.findOneAndDelete({
      _id: deleteId,
      userId: req.user._id,
    });

    if (!deletedContent) {
      res.status(404).json({ message: "Content not found or unauthorized" });
      return;
    }

    // Remove reference from user's content array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { content: deleteId },
    });

    return res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    console.log("Error deleting content:", error);
    res.status(500).json({ message: "Error deleting content" });
    return;
  }
};

// Controller to fetch all content for the authenticated user
const UserContent = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  try {
    const user = await User.findById(req.user._id)
      .populate("content")
      .select("-password -refreshToken");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User's content fetched successfully",
      content: user.content,
    });
  } catch (err) {
    console.log("Error fetching the content", err);
    res.status(500).json({ message: "Server Error" });
    return;
  }
};

const Share = async (req: Request, res: Response) => {
  const { share } = req.body;

  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized Request" });
    return;
  }

  if (typeof share === "boolean") {
    if (share) {
      // Check if a link already exists for this user
      const existingLink = await Link.findOne({
        userId: req.user._id,
      });

      if (existingLink) {
        res.json({ hash: existingLink.hash });
        return;
      }
      // Generate and save a new hash link
      const hash = generateNanoId(10);
      await Link.create({
        userId: req.user._id,
        hash,
      });
      res.json({ hash });
    } else {
      // Remove existing link associated with user if share is false
      await Link.deleteOne({ userId: req.user._id });
      res.json({ message: "Removed link" });
    }
  } else {
    // Handle case when 'share' is missing or invalid
    res.status(400).json({ message: "'share' boolean flag is required" });
    return;
  }
};

const ShareLink = async (req: Request, res: Response) => {
  const sharelink = req.params.hash;

  try {
    const link = await Link.findOne({ hash: sharelink });
    if (!link) {
      res.status(404).json({ message: "Invalid share link" });
      return;
    }

    const content = await Content.find({ userId: link.userId });
    const user = await User.findById(link.userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      username: user.username,
      content,
    });
  } catch (error) {
    console.log("Error fetching shared content:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
// Check current user's share status
const MyLink = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const existingLink = await Link.findOne({ userId: req.user._id });

    if (existingLink) {
      res.json({
        share: true,
        hash: existingLink.hash,
      });
    } else {
      res.json({
        share: false,
      });
    }
  } catch (error) {
    console.error("Error fetching link:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { AddContent, DeleteContent, UserContent, Share, ShareLink, MyLink };
