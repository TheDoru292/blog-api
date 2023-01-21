var express = require("express");
var router = express.Router();

const comments = require("./comments");
const auth = require("./auth");
const post = require("./posts");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_LINK);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

/* GET home page. */
router.get("/", (req, res, next) => {
  res.json({ success: true, message: "Hello!" });
});

router.use("/comment", comments);

router.use("/auth", auth);

router.use("/post", post);

module.exports = router;
