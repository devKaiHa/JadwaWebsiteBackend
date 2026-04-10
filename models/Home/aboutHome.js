const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const prizeCertSchema = new mongoose.Schema({
  name: { type: multilingualSchema },
  date: { type: Date, default: Date.now },
  image: String,
  provider: { type: String, default: "" },
});

const aboutHomeSchema = new mongoose.Schema(
  {
    content: { type: multilingualSchema },
    vision: { type: multilingualSchema },
    visionDescription: { type: multilingualSchema },
    message: { type: multilingualSchema },
    messageDescription: { type: multilingualSchema },
    businessApproach: { type: multilingualSchema },
    whyUs: { type: multilingualSchema },
    governance: { type: multilingualSchema },
    prizes: [prizeCertSchema],
    certificates: [prizeCertSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("aboutHome", aboutHomeSchema);
