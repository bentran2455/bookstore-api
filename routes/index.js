const express = require("express");
const app = express();
const bookRouter = require("./book.api.js");

app.get("/", (req, res) => {
  res.status(200).send("Welcome to CoderSchool!");
});

app.use("/books", bookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
