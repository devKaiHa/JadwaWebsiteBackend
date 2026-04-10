const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    requestType: {
      type: String,
      enum: ["investment-inquiry", "partnership", "media", "support"],
      default: "investment-inquiry",
    },
    message: { type: String, default: "" },
    reply: { type: String, default: "" },
    isReplied: { type: Boolean, default: false },
    repliedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["new", "replied", "archived"],
      default: "new",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("messages", messagesSchema);
