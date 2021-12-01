var express = require("express");
var router = express.Router();
const DB = require("./database");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("statistic", {
    title: "Statistic",
  });
});

module.exports = router;
