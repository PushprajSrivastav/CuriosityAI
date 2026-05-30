import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId, // Chat ka _id store hoga
      ref: "Chat",                          // Chat model se link
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "ai"],   // Sirf yeh do values allowed hain
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
