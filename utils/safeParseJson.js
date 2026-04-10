const ApiError = require("./apiError");

const safeParseJSON = (value, fieldName) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new ApiError(`Invalid JSON format for ${fieldName}`, 400);
  }
};

module.exports = safeParseJSON;
