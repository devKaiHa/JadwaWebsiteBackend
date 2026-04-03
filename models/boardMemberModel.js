const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const boardMemberSchema = new mongoose.Schema(
  {
    name: { type: multilingualSchema },
    position: { type: multilingualSchema },
    bio: { type: multilingualSchema },
    birthDate: { type: String, default: "" },
    nationality: { type: String, default: "" }, // country code
    address: { type: multilingualSchema },
    content: { type: multilingualSchema },
    image: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    slug: { type: String, unique: true, index: true },
    isFounder: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("boardMember", boardMemberSchema);
