// app.js
const express = require("express")
const path = require("path");
const logger = require("morgan")
const app = express()
module.exports = app

app.use(logger("tiny"))
app.use(express.static(__dirname + 'public'))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});



