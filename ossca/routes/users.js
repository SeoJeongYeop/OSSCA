var express = require('express');
const DB = require('./database');
var router = express.Router();

/* GET users listing. */
router.get('/:name', function(req, res, next) {
  const query = `CALL RepoOwnerScore('` + req.params.name + `')`; 
  console.log(req.params.name);
  DB("GET", query, []).then(function(result, error){
    if (error) {
      console.log(error);
    }
    result.row = result.row[0]
    if(result.row.length == 0){
      res.send("No")
    }
    user = result.row[0]
    console.log(user)
    res.render("users", {
      title: "User",
      user: result.row[0],
      repos: result.row,
    });

  });
});

module.exports = router;
