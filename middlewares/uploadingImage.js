const multer = require("multer");
const ApiError = require("../utils/apiError");

// إعدادات Multer العامة
const multerOptions = () => {
  // تخزين الملفات مؤقتًا في الذاكرة
  const multerStorage = multer.memoryStorage();

  // فلتر للتحقق من نوع الملف (يسمح فقط بالصور)
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images are allowed", 400), false);
    }
  };

  // تهيئة Multer مع تحديد حدود الملفات والحقول
  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
      fieldSize: 5 * 1024 * 1024, // 5MB لكل حقل نصي
      fileSize: 10 * 1024 * 1024, // 10MB لكل ملف
    },
  });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) => multerOptions().fields(arrayOfFields);