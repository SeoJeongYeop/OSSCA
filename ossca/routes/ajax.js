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

router.get('/contribute_student/:repo_owner/:repo_name', function(req, res){
  DB("GET", "CALL GetContributor('" + req.params.repo_owner +"', '" + req.params.repo_name + "');").then(function(result, error){
    if (error) {
      console.log(error);
    }
    else {
      result.row = result.row[0]
      res.render("contribute_card", {
        data: result.row
      });
    }
  });
});


module.exports = router;