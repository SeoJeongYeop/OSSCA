var express = require('express');
const DB = require('./database');
var router = express.Router();

router.get("/", function (req, res, next) {
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
      if(result.row[i].commit_lines == null)
        result.row[i].commit_lines = 0;
      if(result.row[i].year != prev_year){
        prev_year = result.row[i].year;
        rank = 1;
      }
      result.row[i].rank = rank;
      rank += 1;
    }
    console.log(result.row.length);
    res.render("user", {
      title: "User",
      table: result.row,
      size: result.row.length,
    });
  });
});

/* GET users listing. */
router.get('/:student_id', function(req, res) {
  const query = `SELECT * FROM student_tab A, github_score B WHERE A.id = '` + req.params.student_id + `' AND A.github_id = B.github_id`; 
  console.log('user: ' + req.params.student_id);
  DB("GET", query, []).then(function(result, error){
    if (error) {
      console.log(error);
    }
    if(result.row.length == 0){
      res.send("No")
    }
    user = result.row[0]
    console.log(user)
    res.render("user_personal", {
      title: "User",
      user: user
    });
  });
});

module.exports = router;
