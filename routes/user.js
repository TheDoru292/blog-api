const express = require("express");
const router = express.Router();
const user = require("../controllers/userController");

router.get("/", user.checkIfLogged, user.getUserDetails);

module.exports = router;
