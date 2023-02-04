const express = require("express");
const router = express.Router();
const post = require("../controllers/postController");
const auth = require("../controllers/userController");

router.get("/", post.getAll);

router.post("/", auth.checkIfLogged, auth.checkIfAuthor, post.post);

router.get("/:para", post.get);

router.put("/:postId", auth.checkIfLogged, auth.checkIfAuthor, post.edit);

router.delete("/:postId", auth.checkIfLogged, auth.checkIfAuthor, post.delete);

module.exports = router;
