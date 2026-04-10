const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const companiesSchema = new mongoose.Schema(
  {
    name: { type: multilingualSchema },
    logo: { type: String, default: "" },
    background: { type: String, default: "" },
    about: { type: multilingualSchema },
    experienceYears: { type: String, default: "" },
    experienceField: { type: multilingualSchema },
    slug: { type: String, default: "" },
    social_links: {
      xTwitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    content: { type: multilingualSchema },
    country: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    services: { type: [multilingualSchema], default: [] },
    values: { type: [multilingualSchema], default: [] },
    addresses: { type: [multilingualSchema], default: [] },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    goals: { type: [multilingualSchema], default: [] },
    statistics: {
      type: [
        {
          title: { type: multilingualSchema },
          value: { type: String, default: "" },
          description: { type: multilingualSchema },
        },
      ],
      default: [],
    },
    fundsAssociated: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "investmentFunds",
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("companies", companiesSchema);
