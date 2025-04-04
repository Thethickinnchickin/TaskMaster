import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth";
// import taskRoutes from "./routes/tasks";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/tasks", taskRoutes);

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://mattreileydeveloper:pro82Des@main.9j7d6op.mongodb.net/?retryWrites=true&w=majority&appName=Main' as string)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
