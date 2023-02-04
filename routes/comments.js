const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const commentController = require("../controllers/commentController");

router.get("/:postId", checkPostId, commentController.getAll);

router.post("/:postId", checkPostId, commentController.add);

function checkPostId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.postId)) {
    return res.json({
      success: false,
      code: 400,
      status: "Bad Request",
      title: "Please enter a valid post ID.",
    });
  }

  next();
}

module.exports = router;
