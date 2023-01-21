const mongoose = require("mongoose");
mongoose.set("debug", (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  comment: String,
  date: { type: Schema.Types.Date },
});

module.exports = mongoose.model("Comment", CommentSchema);
