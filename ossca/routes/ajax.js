var express = require('express');
const DB = require('./database');
var router = express.Router();

router.get('/owned_repo', function(req, res){
  DB("GET", "CALL RepoContributeYearScore('" + req.query.student_id +"');").then(function(result, error){
    if (error) {
      console.log(error);
    }
    else {
      result.row = result.row[0]
      filtered = {}
      for(i = 0; i < result.row.length; i++){
        if(result.row[i].GITHUB_USERNAME == result.row[i].github_id){
          repo_name = result.row[i].github_id + '/' + result.row[i].repo_name
          if(repo_name in filtered){
            filtered[repo_name].push(result.row[i]);
          }
          else{
            filtered[repo_name] = []
            filtered[repo_name].push(result.row[i]);
          }
        }
      }
      res.render('repo_card', {
        type: "owned",
        repos: filtered
      });
    }
  });
});

router.get('/contr_repo', function(req, res){
  DB("GET", "CALL RepoContributeYearScore('" + req.query.student_id +"');").then(function(result, error){
    if (error) {
      console.log(error);
    }
    else {
      result.row = result.row[0]
      filtered = {}
      for(i = 0; i < result.row.length; i++){
        if(result.row[i].GITHUB_USERNAME != result.row[i].github_id){
          repo_name = result.row[i].github_id + '/' + result.row[i].repo_name
          if(repo_name in filtered){
            filtered[repo_name].push(result.row[i]);
          }
          else{
            filtered[repo_name] = []
            filtered[repo_name].push(result.row[i]);
          }
        }
      }
      res.render("repo_card", {
        type: "contr",
        repos: filtered
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