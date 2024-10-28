const crypto = require("crypto");
const fs = require("fs");
const { Router } = require("express");
const express = require("express");
const { get } = require(".");
const { parse } = require("path");
const { send, title } = require("process");
const { post, put, delete: deleteBook } = require("./book.api");
const { stringify } = require("querystring");
const router = express.Router();

router.get("/", (req, res, next) => {
  //input validation
  const allowedFilter = [
    "author",
    "country",
    "language",
    "title",
    "page",
    "limit",
  ];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    //allow title,limit and page query string only
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    //processing logic
    //send response
  } catch (error) {
    next(error);
  }
  //processing logic
  let offset = limit * (page - 1);

  //Read data from db.json then parse to JSobject
  let db = fs.readFileSync("db.json", "utf-8");
  db = JSON.parse(db);
  const { books } = db;
  //Filter data by title
  let result = [];

  if (filterKeys.length) {
    filterKeys.forEach((condition) => {
      result = result.length
        ? result.filter((book) => book[condition] === filterQuery[condition])
        : books.filter((book) => book[condition] === filterQuery[condition]);
    });
  } else {
    result = books;
  }
  //then select number of result by offset
  result = result.slice(offset, offset + limit);
  //send response
  res.status(200).send(result);
});

router.post("/", (req, res, next) => {
  //post input validation
  try {
    const { author, country, imageLink, language, pages, title, year } =
      req.body;
    if (
      !author ||
      !country ||
      !imageLink ||
      !language ||
      !pages ||
      !title ||
      !year
    ) {
      const exception = new Error(`Missing body info`);
      exception.statusCode = 401;
      throw exception;
    }
    //post processing
    //post send response
  } catch (error) {
    next(error);
  }
  //post processing logic
  const newBook = {
    author,
    country,
    imageLink,
    language,
    pages: parseInt(pages) || 1,
    title,
    year: parseInt(year) || 0,
    id: crypto.randomBytes(4).toString("hex"),
  };
  //Read data from db.json then parse to JSobject
  let db = fs.readFileSync("db.json", "utf-8");
  db = JSON.parse(db);
  const { books } = db;

  //Add new book to book JS object
  books.push(newBook);
  //Add new book to db JS object
  db.books = books;
  //db JSobject to JSON string
  db = JSON.stringify(db);
  //write and save to db.json
  fs.writeFileSync("db.json", db);
  //post send response
  res.status(200).send(newBook);
});

router.put("/:bookId", (req, res, next) => {
  //put input validation
  try {
    const allowUpdate = [
      "author",
      "country",
      "imageLink",
      "language",
      "pages",
      "title",
      "year",
    ];

    const { bookId } = req.params;

    const updates = req.body;
    const updateKeys = Object.keys(updates);
    //find update request that not allow
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));

    if (notAllow.length) {
      const exception = new Error(`Update field not allow`);
      exception.statusCode = 401;
      throw exception;
    }
    //put processing
    //put send response
  } catch (error) {
    next(error);
  }

  //put processing logic
  let db = fs.readFileSync("db.json", "utf-8");
  db = JSON.parse(db);
  const { books } = db;
  //find book by id
  const targetIndex = books.findIndex((book) => book.id === bookId);
  if (targetIndex < 0) {
    const exception = new Error(`Book not found`);
    exception.statusCode = 404;
    throw exception;
  }
  //Update new content to db book JS object
  const updatedBook = { ...db.books[targetIndex], ...updates };
  db.books[targetIndex] = updatedBook;

  //db JSobject to JSON string

  db = JSON.stringify(db);
  //write and save to db.json
  fs.writeFileSync("db.json", db);

  res.status(200).send(updatedBook);
});

router.delete("/:bookId", (req, res, next) => {
  //delete input validation
  try {
    const { bookId } = req.params;
    //delete processing
    //delete send response
  } catch (error) {
    next(error);
  }
  //delete processing logic
  //Read data from db.json then parse to JSobject
  let db = fs.readFileSync("db.json", "utf-8");
  db = JSON.parse(db);
  const { books } = db;
  //find book by id
  const targetIndex = books.findIndex((book) => book.id === bookId);
  if (targetIndex < 0) {
    const exception = new Error(`Book not found`);
    exception.statusCode = 404;
    throw exception;
  }
  //filter db books object
  db.books = books.filter((book) => book.id !== bookId);
  //db JSobject to JSON string

  db = JSON.stringify(db);
  //write and save to db.json

  fs.writeFileSync("db.json", db);
  //delete send response
  res.status(200).send({});
});

module.exports = router;
