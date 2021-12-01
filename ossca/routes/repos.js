var express = require('express');
const DB = require('./database');
var router = express.Router();

router.get("/", function (req, res, next) {
  const query = `call RepoTable();`;
  DB("GET", query, []).then(function (result, error) {
    if (error) {
      console.log(error);
    }
    result.row = result.row[0];
    console.log(result.row.length);
    res.render("repo", {
      title: "Repository",
      table: result.row,
      size: result.row.length,
    });
  });
});

module.exports = router;