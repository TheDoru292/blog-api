const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  title: String,
  date: { type: Schema.Types.Date },
});

module.exports = mongoose.model("Comment", CommentSchema);
