const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const dbConnection = require("./config/database");
const apiRoutes = require("./routes/index.js");

dotenv.config({ path: "config.env" });

dbConnection();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount routes here
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
