// import express from "express";
// import Task from "../models/Task";
// import authMiddleware from "../middleware/auth";

// const router = express.Router();

// // CREATE TASK
// router.post("/", authMiddleware, async (req, res) => {
//   const { title } = req.body;
//   const userId = req.userId;
//   const task = new Task({ title, userId });
//   await task.save();
//   res.status(201).json(task);
// });

// // GET TASKS
// router.get("/", authMiddleware, async (req, res) => {
//   const tasks = await Task.find({ userId: req.userId });
//   res.json(tasks);
// });

// // DELETE TASK
// router.delete("/:id", authMiddleware, async (req, res) => {
//   await Task.findByIdAndDelete(req.params.id);
//   res.json({ message: "Task deleted" });
// });

// export default router;
