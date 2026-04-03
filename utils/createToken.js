const jwt = require("jsonwebtoken");

const craeteToken = (payload) => {
  return jwt.sign({ userid: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

module.exports = craeteToken;