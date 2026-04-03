const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const aboutHomeSchema = new mongoose.Schema(
  {
    content: { type: multilingualSchema },
    vision: { type: multilingualSchema },
    visionDescription: { type: multilingualSchema },
    message: { type: multilingualSchema },
    messageDescription: { type: multilingualSchema },
  },
  { timestamps: true },
);

module.exports = mongoose.model("aboutHome", aboutHomeSchema);
