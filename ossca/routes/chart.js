const express = require("express");
const router = express.Router();
const DB = require("./database");

router.get("/", (req, res, next) => {
  let query = `SELECT gs.github_id, gs.year, gs.excellent_contributor, 
round(gs.guideline_score+gs.code_score+gs.other_project_score,1) as owner_score, 
gs.contributor_score, round(gs.star_score+gs.contribution_score,1) as additional_score,  
gs.best_repo, gs.star_count, gs.commit_count, gs.pr_count, gs.issue_count, st.id, st.dept
FROM github_score as gs JOIN student_tab as st ON gs.github_id = st.github_id;`;
  console.log(query);
  let repoQuery = `select grs.create_date from github_repo_stats as grs;`;
  DB("GET", query, []).then(function (result, error) {
    if (error) {
      console.log(error);
    }

    // [1] 3점 이상 비율, 총 커밋 수  총 스타 수, 총 레포 수 같은것을 서버로 보내놔야한다.
    // [2] 점수분포를 보내놔야한다.
    // [3] 학년별, 학과별, 연도별로 나눌 수 있어야 한다.
    // 일단 2번까지는 할 수 있을 것 같다.
    // 학번과 레포 연도는 역순으로 저장한다.
    let scoreDist = create2DArray(3, 10);
    let scoreDept = create2DArray(3, 3);
    let scoreSid = create2DArray(3, 7);
    let scoreMore3 = [0, 0, 0];
    let totalCommit = [0, 0, 0];
    let totalStar = [0, 0, 0];
    let scoreAnnual = [0, 0, 0];
    let commitAnnual = [0, 0, 0];
    let starAnnual = [0, 0, 0];
    let prAnnual = [0, 0, 0];
    let issueAnnual = [0, 0, 0];
    let annualCnt = [0, 0, 0];
    let size = [0, 0, 0];
    let sidSize = create2DArray(3, 7);
    let deptSize = create2DArray(3, 3);
    const startYear = 2019;
    const nowYear = 2021;
    // About Commit
    let commitDist = create2DArray(3, 5);
    let commitDept = create2DArray(3, 3);
    let commitSid = create2DArray(3, 7);
    // About Star
    let starDist = create2DArray(3, 5);
    let starDept = create2DArray(3, 3);
    let starSid = create2DArray(3, 7);
    // About PRs
    let prDist = create2DArray(3, 5);
    let prDept = create2DArray(3, 3);
    let prSid = create2DArray(3, 7);
    // About Issues
    let issueDist = create2DArray(3, 5);
    let issueDept = create2DArray(3, 3);
    let issueSid = create2DArray(3, 7);

    let repoDist = [0, 0, 0, 0, 0, 0, 0];
    let totalRepo = 0;
    let deptDict = { 소프트웨어학과: 0, 글로벌융합학부: 1, 컴퓨터공학과: 2 };

    /* ------------------------------*/
    try {
      let Row;
      let idx1;
      let idxId;
      for (i = 0; i < result.row.length; i++) {
        Row = result.row[i];

        idx1 = Row.year - startYear;
        idxId = nowYear - Math.floor(Row.id / 1000000);

        totalCommit[idx1] += Row.commit_count;
        totalStar[idx1] += Row.star_count;
        Row.total_score = (
          Row.excellent_contributor +
          Row.owner_score +
          Row.contributor_score +
          Row.additional_score
        ).toFixed(1);
        size[idx1] += 1;
        /* student id */
        commitSid[idx1][idxId] += Row.commit_count;
        starSid[idx1][idxId] += Row.star_count;
        scoreSid[idx1][idxId] += Number(Row.total_score);
        prSid[idx1][idxId] += Row.pr_count;
        issueSid[idx1][idxId] += Row.issue_count;
        sidSize[idx1][idxId] += 1;
        /* dept */
        commitDept[idx1][deptDict[Row.dept]] += Row.commit_count;
        starDept[idx1][deptDict[Row.dept]] += Row.star_count;
        scoreDept[idx1][deptDict[Row.dept]] += Number(Row.total_score);
        prDept[idx1][deptDict[Row.dept]] += Row.pr_count;
        issueDept[idx1][deptDict[Row.dept]] += Row.issue_count;
        deptSize[idx1][deptDict[Row.dept]] += 1;
        if (Row.total_score < 0.5) {
          scoreDist[idx1][0] += 1;
        } else if (Row.total_score < 1) {
          scoreDist[idx1][1] += 1;
        } else if (Row.total_score < 1.5) {
          scoreDist[idx1][2] += 1;
        } else if (Row.total_score < 2) {
          scoreDist[idx1][3] += 1;
        } else if (Row.total_score < 2.5) {
          scoreDist[idx1][4] += 1;
        } else if (Row.total_score < 3) {
          scoreDist[idx1][5] += 1;
        } else if (Row.total_score < 3.5) {
          scoreDist[idx1][6] += 1;
          scoreMore3[idx1] += 1;
        } else if (Row.total_score < 4) {
          scoreDist[idx1][7] += 1;
          scoreMore3[idx1] += 1;
        } else if (Row.total_score < 4.5) {
          scoreDist[idx1][8] += 1;
          scoreMore3[idx1] += 1;
        } else if (Row.total_score >= 4.5) {
          scoreDist[idx1][9] += 1;
          scoreMore3[idx1] += 1;
        }
        if (Row.commit_count < 100) {
          commitDist[idx1][0] += 1;
        } else if (Row.commit_count < 200) {
          commitDist[idx1][1] += 1;
        } else if (Row.commit_count < 300) {
          commitDist[idx1][2] += 1;
        } else if (Row.commit_count < 400) {
          commitDist[idx1][3] += 1;
        } else if (Row.commit_count >= 400) {
          commitDist[idx1][4] += 1;
        }
        if (Row.star_count === 0) {
          starDist[idx1][0] += 1;
        } else if (Row.star_count <= 2) {
          starDist[idx1][1] += 1;
        } else if (Row.star_count <= 4) {
          starDist[idx1][2] += 1;
        } else if (Row.star_count <= 6) {
          starDist[idx1][3] += 1;
        } else if (Row.star_count > 6) {
          starDist[idx1][4] += 1;
        }
        if (Row.pr_count === 0) {
          prDist[idx1][0] += 1;
        } else if (Row.star_count <= 10) {
          prDist[idx1][1] += 1;
        } else if (Row.star_count <= 20) {
          prDist[idx1][2] += 1;
        } else if (Row.star_count <= 30) {
          prDist[idx1][3] += 1;
        } else if (Row.star_count > 30) {
          prDist[idx1][4] += 1;
        }
        if (Row.issue_count === 0) {
          issueDist[idx1][0] += 1;
        } else if (Row.star_count <= 5) {
          issueDist[idx1][1] += 1;
        } else if (Row.star_count <= 10) {
          issueDist[idx1][2] += 1;
        } else if (Row.star_count <= 15) {
          issueDist[idx1][3] += 1;
        } else if (Row.star_count > 15) {
          issueDist[idx1][4] += 1;
        }
        // annual
        scoreAnnual[idx1] += Number(Row.total_score);
        commitAnnual[idx1] += Row.commit_count;
        starAnnual[idx1] += Row.star_count;
        prAnnual[idx1] += Row.pr_count;
        issueAnnual[idx1] += Row.issue_count;
        annualCnt[idx1] += 1;
      }

      // object 타입으로 map함수 사용불가
      for (let i = 0; i < nowYear - startYear + 1; i++) {
        for (let j = 0; j < scoreSid[i].length; j++) {
          commitSid[i][j] = (commitSid[i][j] / sidSize[i][j]).toFixed(1);
          starSid[i][j] = (starSid[i][j] / sidSize[i][j]).toFixed(2);
          scoreSid[i][j] = (scoreSid[i][j] / sidSize[i][j]).toFixed(2);
          prSid[i][j] = (prSid[i][j] / sidSize[i][j]).toFixed(2);
          issueSid[i][j] = (issueSid[i][j] / sidSize[i][j]).toFixed(2);
        }
      }

      for (let i = 0; i < nowYear - startYear + 1; i++) {
        for (let j = 0; j < scoreDept[i].length; j++) {
          commitDept[i][j] = (commitDept[i][j] / deptSize[i][j]).toFixed(1);
          starDept[i][j] = (starDept[i][j] / deptSize[i][j]).toFixed(2);
          scoreDept[i][j] = (scoreDept[i][j] / deptSize[i][j]).toFixed(2);
          prDept[i][j] = (prDept[i][j] / deptSize[i][j]).toFixed(2);
          issueDept[i][j] = (issueDept[i][j] / deptSize[i][j]).toFixed(2);
        }
      }
      // 연도별 점수, 커밋, 스타, pr, issue 평균 계산
      scoreAnnual = calculateMeanOfArray(scoreAnnual);
      commitAnnual = calculateMeanOfArray(commitAnnual);
      starAnnual = calculateMeanOfArray(starAnnual);
      prAnnual = calculateMeanOfArray(prAnnual);
      issueAnnual = calculateMeanOfArray(issueAnnual);
      function calculateMeanOfArray(arr) {
        return arr.map((val, idx) => {
          return (val / annualCnt[idx]).toFixed(2);
        });
      }

      DB("GET", repoQuery, []).then(function (date, error) {
        totalRepo = date.row.length;
        for (i = 0; i < totalRepo; i++) {
          let idx =
            nowYear -
            parseInt(date.row[i].create_date.toISOString().substring(0, 4));
          repoDist[idx] += 1;
        }
        try {
          //res.json
          console.log(result.row.length);
          res.json({
            title: "chart",
            scoreMore3: scoreMore3,
            totalCommit: totalCommit,
            totalStar: totalStar,
            totalRepo: totalRepo,
            repoDist: repoDist,
            annual: {
              score: scoreAnnual,
              commit: commitAnnual,
              star: starAnnual,
              pr: prAnnual,
              issue: issueAnnual,
            },
            year2019: {
              score_dist: scoreDist[0],
              score_dept: scoreDept[0],
              score_sid: scoreSid[0],
              commit_dist: commitDist[0],
              commit_dept: commitDept[0],
              commit_sid: commitSid[0],
              star_dist: starDist[0],
              star_dept: starDept[0],
              star_sid: starSid[0],
              pr_dist: prDist[0],
              pr_dept: prDept[0],
              pr_sid: prSid[0],
              issue_dist: issueDist[0],
              issue_dept: issueDept[0],
              issue_sid: issueSid[0],
            },
            year2020: {
              score_dist: scoreDist[1],
              score_dept: scoreDept[1],
              score_sid: scoreSid[1],
              commit_dist: commitDist[1],
              commit_dept: commitDept[1],
              commit_sid: commitSid[1],
              star_dist: starDist[1],
              star_dept: starDept[1],
              star_sid: starSid[1],
              pr_dist: prDist[1],
              pr_dept: prDept[1],
              pr_sid: prSid[1],
              issue_dist: issueDist[1],
              issue_dept: issueDept[1],
              issue_sid: issueSid[1],
            },
            year2021: {
              score_dist: scoreDist[2],
              score_dept: scoreDept[2],
              score_sid: scoreSid[2],
              commit_dist: commitDist[2],
              commit_dept: commitDept[2],
              commit_sid: commitSid[2],
              star_dist: starDist[2],
              star_dept: starDept[2],
              star_sid: starSid[2],
              pr_dist: prDist[2],
              pr_dept: prDept[2],
              pr_sid: prSid[2],
              issue_dist: issueDist[2],
              issue_dept: issueDept[2],
              issue_sid: issueSid[2],
            },

            size: size,
            /*factors: result.row,*/
          });
        } catch (err) {
          console.log("res.json(): ", err);
        }
      });
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
