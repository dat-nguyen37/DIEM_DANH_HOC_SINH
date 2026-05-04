const express = require("express");
const router = express.Router();
const userController = require("../Controller/User");

router.post("/login", userController.login);

module.exports = router;
