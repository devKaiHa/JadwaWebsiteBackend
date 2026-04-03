const mongoose = require("mongoose");

const dbConnection = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewURlParser: true,
      useUnifiedTopology: true,
    })
    .then((conn) => {
      console.log(`database Connceted:${conn.connection.host}`);
    })
    .catch((err) => {
      console.error(`Database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;
