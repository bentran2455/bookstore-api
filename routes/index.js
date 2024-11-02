const express = require("express");
var router = express.Router();
const bookRouter = require("./book.api.js");

router.get("/", (req, res) => {
  res.status(200).send("Welcome to CoderSchool!");
});

router.use("/books", bookRouter);

module.exports = router;
