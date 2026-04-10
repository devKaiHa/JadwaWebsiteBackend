const asyncHandler = require("express-async-handler");
const AboutModel = require("../../models/Home/aboutHome");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const safeParseJSON = require("../../utils/safeParseJson");

const aboutUploadsDir = path.join("uploads", "homeAbout");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
  limits: {
    fieldSize: 5 * 1024 * 1024,
    fileSize: 10 * 1024 * 1024,
  },
});

exports.uploadAboutImages = upload.any();

const ensureUploadsDir = async () => {
  await fs.promises.mkdir(aboutUploadsDir, { recursive: true });
};

const persistImage = async (file, prefix) => {
  const filename = `${prefix}-${uuidv4()}-${Date.now()}.webp`;

  await ensureUploadsDir();
  await sharp(file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(path.join(aboutUploadsDir, filename));

  return filename;
};

exports.resizeAboutImages = asyncHandler(async (req, res, next) => {
  const filesMap = new Map(
    (req.files || []).map((file) => [file.fieldname, file]),
  );

  const prizes = safeParseJSON(req.body.prizes, "prizes") || [];
  const certificates =
    safeParseJSON(req.body.certificates, "certificates") || [];

  const updateCollectionImages = async (collection, prefix) => {
    const updatedItems = [];

    for (const item of collection) {
      const nextItem = { ...item };

      if (item?.imageField && filesMap.has(item.imageField)) {
        nextItem.image = await persistImage(filesMap.get(item.imageField), prefix);
      }

      delete nextItem.imageField;
      updatedItems.push(nextItem);
    }

    return updatedItems;
  };

  if (req.body.content !== undefined) {
    req.body.content = safeParseJSON(req.body.content, "content");
  }

  if (req.body.vision !== undefined) {
    req.body.vision = safeParseJSON(req.body.vision, "vision");
  }

  if (req.body.visionDescription !== undefined) {
    req.body.visionDescription = safeParseJSON(
      req.body.visionDescription,
      "visionDescription",
    );
  }

  if (req.body.message !== undefined) {
    req.body.message = safeParseJSON(req.body.message, "message");
  }

  if (req.body.messageDescription !== undefined) {
    req.body.messageDescription = safeParseJSON(
      req.body.messageDescription,
      "messageDescription",
    );
  }

  if (req.body.businessApproach !== undefined) {
    req.body.businessApproach = safeParseJSON(
      req.body.businessApproach,
      "businessApproach",
    );
  }

  if (req.body.whyUs !== undefined) {
    req.body.whyUs = safeParseJSON(req.body.whyUs, "whyUs");
  }

  if (req.body.governance !== undefined) {
    req.body.governance = safeParseJSON(req.body.governance, "governance");
  }

  if (req.body.prizes !== undefined) {
    req.body.prizes = await updateCollectionImages(prizes, "about-prize");
  }

  if (req.body.certificates !== undefined) {
    req.body.certificates = await updateCollectionImages(
      certificates,
      "about-certificate",
    );
  }

  next();
});

exports.getAboutHome = asyncHandler(async (req, res, next) => {
  const about = await AboutModel.findOne();

  res.status(200).json({
    status: true,
    message: about ? "About home fetched successfully" : "About home not found",
    data: about,
  });
});

exports.updateAboutHome = asyncHandler(async (req, res, next) => {
  const updatedAbout = await AboutModel.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  res.status(200).json({
    status: true,
    message: "About home saved successfully",
    data: updatedAbout,
  });
});
