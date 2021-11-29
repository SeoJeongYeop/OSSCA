var express = require('express');
const DB = require('./database');
var router = express.Router();

/* GET users listing. */
router.get('/:student_id', function(req, res) {
  const query = `SELECT * FROM student_tab A WHERE A.id = '` + req.params.student_id + `'`; 
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
    res.render("users", {
      title: "User",
      user: user
    });
  });
});

module.exports = router;
