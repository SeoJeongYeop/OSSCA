const express = require("express");
const router = express.Router();
const DB = require("./database");

router.get("/", (req, res, next) => {
  let factor = "score"; // 버튼 누르면 바뀔 수 있게 할 것.
  let query;
  if (factor == "score") {
    //query = `select * from github_score;`;
    query = `SELECT gs.github_id, gs.year, gs.excellent_contributor, 
round(gs.guideline_score+gs.code_score+gs.other_project_score,1) as owner_score, 
gs.contributor_score, round(gs.star_score+gs.contribution_score,1) as additional_score,  
gs.best_repo, go.stars, go.followers, go.followings, go.total_commits, go.total_repos, gs.star_count, gs.commit_count 
FROM github_score as gs LEFT JOIN github_overview as go 
ON gs.github_id = go.github_id;`;
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
    let distribution = create2DArray(3, 10);
    let dept = create2DArray(3, 3);
    let year = create2DArray(3, 5);
    let totalCommit = 0;
    let totalStar = 0;
    let totalRepo = 0;
    let annual = [0, 0, 0];
    let annualCnt = [0, 0, 0];
    let size = [0, 0, 0];
    const startYear = 2019;
    // About Commit
    let commitDist = create2DArray(3, 5);
    let commitDept = create2DArray(3, 3);
    let commitYear = create2DArray(3, 5);
    // About Star
    let starDist = create2DArray(3, 5);
    let starDept = create2DArray(3, 3);
    let starYear = create2DArray(3, 5);

    /* insert fake value : year, dept*/
    // year 10 20 15 13
    year = [
      [1.6, 2.0, 2.5, 3.0, 2.8],
      [1.8, 2.2, 2.7, 3.2, 3.0],
      [2.0, 2.4, 2.9, 3.4, 3.2],
    ];
    starYear = year;
    commitYear = year;
    dept = [
      [2.5, 2.5, 2.5],
      [2.7, 2.7, 2.7],
      [2.9, 2.9, 2.9],
    ];
    starDept = dept;
    commitDept = dept;
    /* ------------------------------*/
    try {
      let Row;
      for (i = 0; i < result.row.length; i++) {
        Row = result.row[i];
        totalCommit += Row.total_commits;
        totalStar += Row.stars;
        totalRepo += Row.total_repos;
        result.row[i].total_score = (
          Row.excellent_contributor +
          Row.owner_score +
          Row.contributor_score +
          Row.additional_score
        ).toFixed(1);
        size[Row.year - startYear] += 1;
        if (Row.total_score < 0.5) {
          distribution[Row.year - startYear][0] += 1;
        } else if (Row.total_score < 1) {
          distribution[Row.year - startYear][1] += 1;
        } else if (Row.total_score < 1.5) {
          distribution[Row.year - startYear][2] += 1;
        } else if (Row.total_score < 2) {
          distribution[Row.year - startYear][3] += 1;
        } else if (Row.total_score < 2.5) {
          distribution[Row.year - startYear][4] += 1;
        } else if (Row.total_score < 3) {
          distribution[Row.year - startYear][5] += 1;
        } else if (Row.total_score < 3.5) {
          distribution[Row.year - startYear][6] += 1;
        } else if (Row.total_score < 4) {
          distribution[Row.year - startYear][7] += 1;
        } else if (Row.total_score < 4.5) {
          distribution[Row.year - startYear][8] += 1;
        } else if (Row.total_score >= 4.5) {
          distribution[Row.year - startYear][9] += 1;
        }
        if (Row.commit_count < 100) {
          commitDist[Row.year - startYear][0] += 1;
        } else if (Row.commit_count < 200) {
          commitDist[Row.year - startYear][1] += 1;
        } else if (Row.commit_count < 300) {
          commitDist[Row.year - startYear][2] += 1;
        } else if (Row.commit_count < 400) {
          commitDist[Row.year - startYear][3] += 1;
        } else if (Row.commit_count >= 400) {
          commitDist[Row.year - startYear][4] += 1;
        }
        if (Row.star_count === 0) {
          starDist[Row.year - startYear][0] += 1;
        } else if (Row.star_count <= 2) {
          starDist[Row.year - startYear][1] += 1;
        } else if (Row.star_count <= 4) {
          starDist[Row.year - startYear][2] += 1;
        } else if (Row.star_count <= 6) {
          starDist[Row.year - startYear][3] += 1;
        } else if (Row.star_count > 6) {
          starDist[Row.year - startYear][4] += 1;
        }
        // annual
        annual[Row.year - startYear] += Number(Row.total_score);
        annualCnt[Row.year - startYear] += 1;
      }
      // response
      try {
        //res.json
        console.log(result.row.length);
        res.json({
          title: "chart",
          totalCommit: totalCommit,
          totalStar: totalStar,
          totalRepo: totalRepo,
          annual: annual,
          annualCnt: annualCnt,
          year2019: {
            distribution: distribution[0],
            dept: dept[0],
            year: year[0],
            commit_dist: commitDist[0],
            commit_dept: commitDept[0],
            commit_year: commitYear[0],
            star_dist: starDist[0],
            star_dept: starDept[0],
            star_year: starYear[0],
          },
          year2020: {
            distribution: distribution[1],
            dept: dept[1],
            year: year[1],
            commit_dist: commitDist[1],
            commit_dept: commitDept[1],
            commit_year: commitYear[1],
            star_dist: starDist[1],
            star_dept: starDept[1],
            star_year: starYear[1],
          },
          year2021: {
            distribution: distribution[2],
            dept: dept[2],
            year: year[2],
            commit_dist: commitDist[2],
            commit_dept: commitDept[2],
            commit_year: commitYear[2],
            star_dist: starDist[2],
            star_dept: starDept[2],
            star_year: starYear[2],
          },
          size: size,
          /*factors: result.row,*/
        });
      } catch (err) {
        console.log("res.json(): ", err);
      }
    } catch (err) {
      console.log("chart.js error: ", err);
    }
  });

  function create2DArray(rows, columns) {
    const arr = new Array(rows);
    for (let i = 0; i < rows; i++) {
      arr[i] = new Array(columns);
      arr[i].fill(0);
    }
    return arr;
  }
});

module.exports = router;
