const express = require("express");
const router = express.Router();
const DB = require("./database");

router.get("/", (req, res, next) => {
  let factor = "score"; // 버튼 누르면 바뀔 수 있게 할 것.
  let query;
  if (factor == "score") {
    query = `select * from github_score;`;
    console.log(query);
  }
  DB("GET", query, []).then(function (result, error) {
    if (error) {
      console.log(error);
    }
    // [1] 3점 이상 비율, 총 커밋 수  총 스타 수, 총 레포 수 같은것을 서버로 보내놔야한다.
    // [2] 점수분포를 보내놔야한다.
    // [3] 학년별, 학과별, 연도별로 나눌 수 있어야 한다.
    // 일단 2번까지는 할 수 있을 것 같다.
    let score_0_1 = 0;
    let score_1_2 = 0;
    let score_2_3 = 0;
    let score_3_4 = 0;
    let score_4_5 = 0;
    try {
      let Row;
      for (i = 0; i < result.row.length; i++) {
        Row = result.row[i];
        result.row[i].total_score = (
          Row.excellent_contributor +
          Row.guideline_score +
          result.row[i].code_score +
          result.row[i].other_project_score +
          result.row[i].contributor_score +
          result.row[i].star_score +
          result.row[i].contribution_score
        ).toFixed(1);
        console.log();
        if (result.row[i].total_score < 1) {
          score_0_1 += 1;
        } else if (result.row[i].total_score < 2) {
          score_1_2 += 1;
        } else if (result.row[i].total_score < 3) {
          score_2_3 += 1;
        } else if (result.row[i].total_score < 4) {
          score_3_4 += 1;
        } else if (result.row[i].total_score <= 5) {
          score_4_5 += 1;
        }
        result.row[i].owner_score = (
          result.row[i].guideline_score +
          result.row[i].code_score +
          result.row[i].other_project_score
        ).toFixed(1);
        result.row[i].additional_score = (
          result.row[i].star_score + result.row[i].contribution_score
        ).toFixed(1);
      }
      // response
      try {
        //res.json
        console.log(score_0_1, score_1_2, score_2_3, score_3_4, score_4_5);
        console.log(result.row.length);
        res.json({
          title: "chart",
          factors: result.row,
          distribution: [score_0_1, score_1_2, score_2_3, score_3_4, score_4_5],
          size: result.row.length,
        });
      } catch (err) {
        console.log("res.json(): ", err);
      }
    } catch (err) {
      console.log("chart.js error: ", err);
    }
  });
});

module.exports = router;
