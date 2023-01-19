require("dotenv").config();
var express = require("express");
var router = express.Router();

const mongoose = require("mongoose");
mongoose.connect = process.env.MONGODB_LINK;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
