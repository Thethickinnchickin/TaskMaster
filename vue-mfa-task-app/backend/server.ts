import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import fs from "fs";
import https from "https";
import path from "path";
import taskRoutes from "./routes/tasks";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "https://localhost:3000", // your frontend URL
  credentials: true // ✅ allow cookies from frontend
}))
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://mattreileydeveloper:pro82Des@main.9j7d6op.mongodb.net/?retryWrites=true&w=majority&appName=Main' as string)
  .then(() => {
    // console.log("✅ Connected to MongoDB");
    // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    console.log("✅ Connected to MongoDB");

    // Read SSL certs
    const certPath = path.join(__dirname, "/certs");
    const key = fs.readFileSync(path.join(certPath, "key.pem"));
    const cert = fs.readFileSync(path.join(certPath, "cert.pem"));

    // Create HTTPS server
    https.createServer({ key, cert }, app).listen(PORT, () => {
      console.log(`🔐 HTTPS Server running at https://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
