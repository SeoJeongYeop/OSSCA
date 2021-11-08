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
    console.log({
      title: "Express",
      table: result.row,
      size: result.row.length,
    });
    console.log(result.row.length);
    res.render("index", {
      title: "Express",
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

module.exports = router;
