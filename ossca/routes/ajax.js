var express = require('express');
const DB = require('./database');
var router = express.Router();

router.get('/owned_repo', function(req, res){
  DB("GET", "CALL RepoOwn('" + req.query.student_id +"');").then(function(result, error){
    if (error) {
      console.log(error);
    }
    else {
      result.row = result.row[0]
      res.render('repo_card', {
        type: "owned",
        repos: result.row
      });
    }
  });
});

router.get('/contr_repo', function(req, res){
  DB("GET", "CALL RepoContribute('" + req.query.student_id +"');").then(function(result, error){
    if (error) {
      console.log(error);
    }
    else {
      result.row = result.row[0]
      res.render("repo_card", {
        type: "contr",
        repos: result.row
      });
    }
  });
});

module.exports = router;