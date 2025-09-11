import { Tag } from "../models/tags.model";
import { Request, Response } from "express";
import z from "zod";
import { Content } from "../models/content.model";
import mongoose from "mongoose";
const addTag = z.object({
  title: z.string(),
});
type addType = z.infer<typeof addTag>;

const AddTag = async (req: Request, res: Response) => {
  const parsedData = addTag.safeParse(req.body);
  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: "Validation Errors", error: parsedData.error.issues });
    return;
  }

  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized Request" });
    return;
  }

  try {
    const data: addType = parsedData.data;
    const createTag = await Tag.create({
      title: data.title,
      userId: req.user._id,
    });
    if (!createTag) {
      res.status(500).json({ message: "Error creating tag" });
      return;
    }
    res
      .status(201)
      .json({ message: "Tag created successfully", tag: createTag });
  } catch (err) {
    console.error("Error creating tag:", err);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

const addTagsSchema = z.object({
  contentId: z.string(),
  tagIds: z.array(z.string()),
});

type AddTagsInput = z.infer<typeof addTagsSchema>;

const AddTagsToContent = async (req: Request, res: Response) => {
  const parsedData = addTagsSchema.safeParse(req.body);
  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: "Validation errors", error: parsedData.error.issues });
    return;
  }

  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized Request" });
    return;
  }

  const { contentId, tagIds } = parsedData.data;

  try {
    const content = await Content.findOne({
      _id: contentId,
      userId: req.user._id,
    });
    if (!content) {
      res.status(404).json({ message: "Content not found or unauthorized" });
      return;
    }
    content.tags = Array.from(
      new Set([
        ...content.tags.map((id) => id.toString()),
        ...tagIds.map((id) => id.toString()),
      ])
    ).map((id) => new mongoose.Types.ObjectId(id));

    await content.save();
    await content.populate("tags");

    res.status(200).json({ message: "Tags added successfully", content });
  } catch (error) {
    console.error("Error adding tags:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

const deleteTags = async (req: Request, res: Response) => {
  const { contentId, tagId } = req.params;
  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized Request" });
    return;
  }

  try {
    const content = await Content.findOneAndUpdate(
      { _id: contentId, userId: req.user._id },
      { $pull: { tags: new mongoose.Types.ObjectId(tagId) } },
      { new: true }
    ).populate("tags");

    if (!content) {
      res.status(404).json({ message: "Content not found or unauthorized" });
      return;
    }

    res.status(200).json({
      message: "Tag removed from content successfully",
      content,
    });
  } catch (error) {
    console.error("Error removing tag:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

const searchContent = async (req: Request, res: Response) => {
  try {
    const { tagIds, beforeDate } = req.query;
    let filter: any = {};
    if (tagIds) {
      const tagIdArray = (tagIds as string).split(",").map((id) => id.trim());
      filter.tags = {
        $in: tagIdArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (beforeDate) {
      const date = new Date(beforeDate as string);
      if (!isNaN(date.getTime())) {
        filter.createdAt = { $lt: date };
      } else {
        res.status(400).json({ message: "Invalid date format" });
        return;
      }
    }
    const contents = await Content.find(filter).populate("tags");

    res.status(200).json({
      message: "Contents fetched based on search criteria",
      contents,
    });
  } catch (error) {
    console.error("Error searching contents:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
const GetUserTags = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized request" });
    return;
  }

  try {
    const tags = await Tag.find({ userId: req.user._id });
    res.status(200).json({ tags });
  } catch (err) {
    console.error("Error fetching user tags:", err);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
export { AddTag, AddTagsToContent, deleteTags, searchContent, GetUserTags };
