var express = require('express');
const DB = require('./database');
var router = express.Router();


function SortScore(a, b){
  console.log('A', a.name, a.total_score, a.year)
  console.log('B', b, b.name, b.total_score, b.year)
  if(a.year == b.year){
    return b.total_score - a.total_score;
  }
  return a.year - b.year
}

router.get("/", function (req, res, next) {
  const query = `call ScoreTable();`;
  DB("GET", query, []).then(function (result, error) {
    if (error) {
      console.log(error);
    }
    console.log(result.row.length);
    merged = []
    for(i = 0; i < result.row.length - 1; i++){
      console.log(result.row[i]);
      merged = merged.concat(result.row[i])
    }
    prev_year = 0;
    rank = 0;
    merged.sort(SortScore);
    console.log(merged.slice(0, 5));
    for(i = 0; i < merged.length; i++){
      if(merged[i].commit_cnt == null)
        merged[i].commit_cnt = 0;
      if(merged[i].issue_cnt == null)
        merged[i].issue_cnt = 0;
      if(merged[i].pr_cnt == null)
        merged[i].pr_cnt = 0;
      if(merged[i].repo_cnt == null)
        merged[i].repo_cnt = 0;
      if(merged[i].commit_line == null)
        merged[i].commit_line = 0;
      if(merged[i].year != prev_year){
        prev_year = merged[i].year;
        rank = 1;
      }
      merged[i].rank = rank;
      rank += 1;
    }
    res.render("user", {
      title: "User",
      table: merged,
      size: merged.length,
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
