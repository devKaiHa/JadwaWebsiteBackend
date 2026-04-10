const express = require("express");
const statisticsRoute = express.Router();

const {
  getStatistics,
  getPublicStatistics,
  createStatistic,
  getOneStatistic,
  updateStatistic,
  deleteStatistic,
} = require("../services/statisticsService");

// Public
statisticsRoute.get("/public", getPublicStatistics);

// Admin
statisticsRoute.get("/", getStatistics);
statisticsRoute.get("/:id", getOneStatistic);
statisticsRoute.post("/", createStatistic);
statisticsRoute.put("/:id", updateStatistic);
statisticsRoute.delete("/:id", deleteStatistic);

module.exports = statisticsRoute;
