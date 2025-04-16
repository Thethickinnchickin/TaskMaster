import express from "express";
import Task from "../models/Task";
import User from "../models/User";
import { authenticateUser } from "../middleware/auth";
import asyncHandler from "../utils/asyncHandler";

const router = express.Router();

// CREATE TASK
router.post("/", authenticateUser, asyncHandler(async (req, res) => {
  const { title } = req.body;
  const user = (req as any).user;
  const userId = user._id;

  try {
    const task = new Task({ title, userId });
    await task.save();

    // Also add the task to the user's tasks array
    await User.findByIdAndUpdate(userId, {
      $push: { tasks: task._id }
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to create task" });
  }
}));

// GET ALL TASKS
router.get("/", authenticateUser, asyncHandler(async (req, res) => {
  const user = (req as any).user;
  const userId = user._id;

  try {
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch tasks" });
  }
}));

// GET SINGLE TASK
router.get("/:id", authenticateUser, asyncHandler(async (req, res) => {
  const user = (req as any).user;
  const userId = user._id;
  const taskId = req.params.id;

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    res.status(404).json({ message: "❌ Task not found" });
    return;
  }

  res.json(task);
}));


// UPDATE TASK
router.put("/:id", authenticateUser, asyncHandler(async (req, res) => {
  const user = (req as any).user;
  const userId = user._id;
  const taskId = req.params.id;
  const { title, completed } = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { title, completed },
    { new: true }
  );

  if (!task) {
    res.status(404).json({ message: "❌ Task not found" });
    return;
  }

  res.json(task);
}));


// DELETE TASK
router.delete("/:id", authenticateUser, asyncHandler(async (req, res) => {
    const user = (req as any).user;
    const userId = user._id;
    const taskId = req.params.id;
  
    try {
      const task = await Task.findOneAndDelete({ _id: taskId, userId });
      if (!task) {
        res.status(404).json({ message: "❌ Task not found" });
        return;
      }
  
      await User.findByIdAndUpdate(userId, {
        $pull: { tasks: task._id }
      });
  
      res.json({ message: "✅ Task deleted" });
    } catch (err) {
      res.status(500).json({ message: "❌ Error deleting task" });
    }
  }));
  
export default router;
