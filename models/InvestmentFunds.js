const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const investmentFundsSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    content: { type: multilingualSchema },
    image: { type: String, default: "" },
    fundLink: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("investmentFunds", investmentFundsSchema);
