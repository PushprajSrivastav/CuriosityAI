import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // User ka _id store hoga
      ref: "User",                          // User model se link (JOIN jaisa)
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt automatically add hoga
  }
);

const ChatModel = mongoose.model("Chat", chatSchema);

export default ChatModel;
