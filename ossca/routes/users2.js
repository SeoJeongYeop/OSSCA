var express = require('express');
const DB = require('./database');
var router = express.Router();

router.get("/", function (req, res, next) {
  const query = `SELECT * FROM score_table_sub ORDER BY year asc, total_score desc;`;
  DB("GET", query, []).then(function (result, error) {
    if (error) {
      console.log(error);
    }
    prev_year = 0;
    rank = 0;
    for(i = 0; i < result.row.length; i++){
      if(result.row[i].year != prev_year){
        prev_year = result.row[i].year;
        rank = 1;
      }
      result.row[i].rank = rank;
      rank += 1;
    }
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
