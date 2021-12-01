var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var userRouter = require("./routes/users");
var chartRouter = require("./routes/chartdata");
var ajaxRouter = require("./routes/ajax");

var app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8081;
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/chartdata", chartRouter);
app.use("/ajax", ajaxRouter);
// scripts 경로로 접근시 node_modules을 사용할 수 있게 설정
app.use("/scripts", express.static(path.join(__dirname, "node_modules")));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.error(err.stack);
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
