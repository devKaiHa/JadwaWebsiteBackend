const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const investmentFundsSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    slug: { type: String, unique: true, index: true },
    content: { type: multilingualSchema },
    image: { type: String, default: "" },
    fundLink: { type: String, default: "" },
    type: { type: multilingualSchema },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    shortAbout: { type: multilingualSchema },
    launchDate: { type: Date, default: Date.now },
    targetingSectors: { type: [multilingualSchema], default: [] },
    fundDuration: { type: Number, default: 0 },
    durationSuffix: { type: String, default: "" },
    assetsVolume: { type: Number, default: 0 },
    sharePrice: { type: Number, default: 0 },
    minInvestAmount: { type: Number, default: 0 },
    irr: { type: Number, default: 0 }, //Interest Return Rate (probably)
    companiesAssociated: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "companies",
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("investmentFunds", investmentFundsSchema);
