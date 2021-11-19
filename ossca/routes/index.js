var express = require("express");
var router = express.Router();
const DB = require("./database");

/* GET home page. */
router.get("/data", function (req, res, next) {
  const query = `call ScoreTable();`;
  DB("GET", query, []).then(function (result, error) {
    if (error) {
      console.log(error);
    }
    result.row = result.row[0];
    for(i = 0; i < result.row.length; i++){
      if(result.row[i].commits == null)
        result.row[i].commits = 0;
      if(result.row[i].issues == null)
        result.row[i].issues = 0;
      if(result.row[i].pulls == null)
        result.row[i].pulls = 0;
      if(result.row[i].repos == null)
        result.row[i].repos = 0;
    }
    console.log(result.row.length);
    res.render("index", {
      title: "Overview",
      table: result.row,
      size: result.row.length,
    });
  });
  // DB("GET", query2, []).then(function (error, results, fields) {
  //   if (error) {
  //     console.log(error);
  //   }
  //   console.log({ title: "Express", data: results });
  //   res.render("index", { title: "Express", data: results });
  // });
  // connection.query(query1).then(function (error, results, fields) {

  // });
});
router.get("/", function (req, res, next) {
  res.render("statistic", {
    title: "Statistic",
  });
});

module.exports = router;
