const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: Schema.Types.String,
  content: String,
  url: String,
  author: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Post", PostSchema);
