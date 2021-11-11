var express = require("express");
var router = express.Router();
const DB = require("./database");

/* GET home page. */
router.get("/", function (req, res, next) {
  const query1 = `select * from github_score 
where (guideline_score+code_score+other_project_score+contribution_score+star_score+contributor_score) >= 3.0 
and year=2021;`;
  const query2 = `select * from github_score;`;
  DB("GET", query2, []).then(function (result, error) {
    if (error) {
      console.log(error);
    }
    for (i = 0; i < result.row.length; i++) {
      result.row[i].total_score = (
        result.row[i].excellent_contributor +
        result.row[i].guideline_score +
        result.row[i].code_score +
        result.row[i].other_project_score +
        result.row[i].contributor_score +
        result.row[i].star_score +
        result.row[i].contribution_score
      ).toFixed(1);
      result.row[i].owner_score = (
        result.row[i].guideline_score +
        result.row[i].code_score +
        result.row[i].other_project_score
      ).toFixed(1);
      result.row[i].additional_score = (
        result.row[i].star_score + result.row[i].contribution_score
      ).toFixed(1);
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
router.get("/statistic", function (req, res, next) {
  res.render("statistic", {
    title: "Statistic",
  });
});

module.exports = router;
