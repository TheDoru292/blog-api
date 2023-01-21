var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

var apiRouter = require("./routes/api");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  let errorStatus = err.status || 500;
  let errorMessage;

  if (err.status == 404) {
    errorMessage = "Not found.";
  } else if (err.status == 500) {
    errorMessage = "Internal server error.";
  }

  // render the error page
  res.status(errorStatus);
  res.json({ success: false, code: errorStatus, status: errorMessage });
});

module.exports = app;
