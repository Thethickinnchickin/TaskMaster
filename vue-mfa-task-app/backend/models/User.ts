// models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationExpDate: { type: Date },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }]
});


// Pre-save hook to check if the verification code has expired before saving
UserSchema.pre("save", function (next) {
  const user = this;

  if (user.verificationExpDate) {
    const currentDate = new Date();

    // If the current date is greater than the expiration date, invalidate the verification
    if (currentDate > user.verificationExpDate) {
      user.isVerified = false; // Set isVerified to false
      user.verificationExpDate = null; // Clear the expiration date
    }
  }

  next(); // Continue saving the document
});
// Pre-save hook to check if the verification code has expired before saving


export default mongoose.model("User", UserSchema);
