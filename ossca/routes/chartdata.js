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
    const startYear = 2019;
    const nowYear = 2021;
    let deptDict = { 소프트웨어학과: 0, 글로벌융합학부: 1, 컴퓨터공학과: 2 };
    /* Year Data: Mean, Var, Std*/
    let scoreAnnual = [0, 0, 0];
    let commitAnnual = [0, 0, 0];
    let starAnnual = [0, 0, 0];
    let prAnnual = [0, 0, 0];
    let issueAnnual = [0, 0, 0];

    /* Overview Data */
    let scoreMore3 = [0, 0, 0];
    let totalCommit = [0, 0, 0];
    let totalStar = [0, 0, 0];
    let repoDist = [0, 0, 0, 0, 0, 0, 0];
    let totalRepo = 0;

    /* Chart Data: Score, Commits, Stars, PRs, Issues */
    let annualCnt = [0, 0, 0];
    let sidSize = create2DArray(3, 7);
    let deptSize = create2DArray(3, 3);

    // About Score
    let scoreDist = create2DArray(3, 10);
    let scoreDept = create2DArray(3, 3);
    let scoreSid = create2DArray(3, 7);
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

    /* ------------------------------*/
    try {
      let Row;
      let idx1;
      let idxId;
      let idxDept;
      for (i = 0; i < result.row.length; i++) {
        Row = result.row[i];

        idx1 = Row.year - startYear;
        idxId = nowYear - Math.floor(Row.id / 1000000);
        idxDept = deptDict[Row.dept];
        totalCommit[idx1] += Row.commit_count;
        totalStar[idx1] += Row.star_count;
        Row.total_score = (
          Row.excellent_contributor +
          Row.owner_score +
          Row.contributor_score +
          Row.additional_score
        ).toFixed(1);
        /* student id */
        commitSid[idx1][idxId] += Row.commit_count;
        starSid[idx1][idxId] += Row.star_count;
        scoreSid[idx1][idxId] += Number(Row.total_score);
        prSid[idx1][idxId] += Row.pr_count;
        issueSid[idx1][idxId] += Row.issue_count;
        sidSize[idx1][idxId] += 1;
        /* dept */
        commitDept[idx1][idxDept] += Row.commit_count;
        starDept[idx1][idxDept] += Row.star_count;
        scoreDept[idx1][idxDept] += Number(Row.total_score);
        prDept[idx1][idxDept] += Row.pr_count;
        issueDept[idx1][idxDept] += Row.issue_count;
        deptSize[idx1][idxDept] += 1;
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
        if (Row.star_count < 2) {
          starDist[idx1][0] += 1;
        } else if (Row.star_count < 4) {
          starDist[idx1][1] += 1;
        } else if (Row.star_count < 6) {
          starDist[idx1][2] += 1;
        } else if (Row.star_count < 8) {
          starDist[idx1][3] += 1;
        } else if (Row.star_count >= 8) {
          starDist[idx1][4] += 1;
        }
        if (Row.pr_count < 5) {
          prDist[idx1][0] += 1;
        } else if (Row.pr_count < 10) {
          prDist[idx1][1] += 1;
        } else if (Row.pr_count < 15) {
          prDist[idx1][2] += 1;
        } else if (Row.pr_count < 20) {
          prDist[idx1][3] += 1;
        } else if (Row.pr_count >= 20) {
          prDist[idx1][4] += 1;
        }
        if (Row.issue_count < 2) {
          issueDist[idx1][0] += 1;
        } else if (Row.issue_count < 4) {
          issueDist[idx1][1] += 1;
        } else if (Row.issue_count < 6) {
          issueDist[idx1][2] += 1;
        } else if (Row.issue_count < 8) {
          issueDist[idx1][3] += 1;
        } else if (Row.issue_count >= 8) {
          issueDist[idx1][4] += 1;
        }
        // annual Total sum
        scoreAnnual[idx1] += Number(Row.total_score);
        commitAnnual[idx1] += Row.commit_count;
        starAnnual[idx1] += Row.star_count;
        prAnnual[idx1] += Row.pr_count;
        issueAnnual[idx1] += Row.issue_count;
        annualCnt[idx1] += 1;
      }

      /* 학번 평균, 학과 평균 구하기 */
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
      let scoreMean = calculateMeanOfArray(scoreAnnual);
      let commitMean = calculateMeanOfArray(commitAnnual);
      let starMean = calculateMeanOfArray(starAnnual);
      let prMean = calculateMeanOfArray(prAnnual);
      let issueMean = calculateMeanOfArray(issueAnnual);

      function calculateMeanOfArray(arr) {
        return arr.map((val, idx) => {
          return (val / annualCnt[idx]).toFixed(2);
        });
      }

      /* 학번별, 학과별, 연도별에 대해 점수, 커밋, 스타, 풀리, 이슈 등 각각의 분산과 표준편차 계산 */
      const scoreSidDevTotal = create2DArray(3, 7);
      const commitSidDevTotal = create2DArray(3, 7);
      const starSidDevTotal = create2DArray(3, 7);
      const prSidDevTotal = create2DArray(3, 7);
      const issueSidDevTotal = create2DArray(3, 7);
      const scoreDeptDevTotal = create2DArray(3, 3);
      const commitDeptDevTotal = create2DArray(3, 3);
      const starDeptDevTotal = create2DArray(3, 3);
      const prDeptDevTotal = create2DArray(3, 3);
      const issueDeptDevTotal = create2DArray(3, 3);
      const scoreYearDevTotal = [0, 0, 0];
      const commitYearDevTotal = [0, 0, 0];
      const starYearDevTotal = [0, 0, 0];
      const prYearDevTotal = [0, 0, 0];
      const issueYearDevTotal = [0, 0, 0];

      for (i = 0; i < result.row.length; i++) {
        Row = result.row[i];
        idx1 = Row.year - startYear;

        /* student id */
        idxId = nowYear - Math.floor(Row.id / 1000000);
        scoreSidDevTotal[idx1][idxId] += Math.pow(
          Number(Row.total_score) - Number(scoreSid[idx1][idxId]),
          2
        );
        commitSidDevTotal[idx1][idxId] += Math.pow(
          Number(Row.commit_count) - Number(commitSid[idx1][idxId]),
          2
        );
        starSidDevTotal[idx1][idxId] += Math.pow(
          Number(Row.star_count) - Number(starSid[idx1][idxId]),
          2
        );
        prSidDevTotal[idx1][idxId] += Math.pow(
          Number(Row.pr_count) - Number(prSid[idx1][idxId]),
          2
        );
        issueSidDevTotal[idx1][idxId] += Math.pow(
          Number(Row.issue_count) - Number(issueSid[idx1][idxId]),
          2
        );

        /* dept */
        idxDept = deptDict[Row.dept];
        scoreDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.total_score) - scoreDept[idx1][idxDept],
          2
        );

        commitDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.commit_count - commitDept[idx1][idxDept]),
          2
        );
        starDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.star_count - starSid[idx1][idxDept]),
          2
        );
        prDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.pr_count - prSid[idx1][idxDept]),
          2
        );
        issueDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.issue_count - issueSid[idx1][idxDept]),
          2
        );

        /* year */
        scoreYearDevTotal[idx1] += Math.pow(
          Number(Row.total_score) - scoreMean[idx1],
          2
        );
        commitYearDevTotal[idx1] += Math.pow(
          Number(Row.commit_count - commitMean[idx1]),
          2
        );
        starYearDevTotal[idx1] += Math.pow(
          Number(Row.star_count - starMean[idx1]),
          2
        );
        prYearDevTotal[idx1] += Math.pow(
          Number(Row.pr_count - prMean[idx1]),
          2
        );
        issueYearDevTotal[idx1] += Math.pow(
          Number(Row.issue_count - issueMean[idx1]),
          2
        );
      }

      const scoreSidStd = create2DArray(3, 7);
      const commitSidStd = create2DArray(3, 7);
      const starSidStd = create2DArray(3, 7);
      const prSidStd = create2DArray(3, 7);
      const issueSidStd = create2DArray(3, 7);
      const scoreDeptStd = create2DArray(3, 3);
      const commitDeptStd = create2DArray(3, 3);
      const starDeptStd = create2DArray(3, 3);
      const prDeptStd = create2DArray(3, 3);
      const issueDeptStd = create2DArray(3, 3);
      const scoreYearStd = [0, 0, 0];
      const commitYearStd = [0, 0, 0];
      const starYearStd = [0, 0, 0];
      const prYearStd = [0, 0, 0];
      const issueYearStd = [0, 0, 0];

      for (let i = 0; i < nowYear - startYear + 1; i++) {
        for (let j = 0; j < 7; j++) {
          scoreSidStd[i][j] = Math.sqrt(
            Number(scoreSidDevTotal[i][j] / sidSize[i][j])
          ).toFixed(4);
          commitSidStd[i][j] = Math.sqrt(
            Number(commitSidDevTotal[i][j] / sidSize[i][j])
          ).toFixed(4);
          starSidStd[i][j] = Math.sqrt(
            Number(starSidDevTotal[i][j] / sidSize[i][j])
          ).toFixed(4);
          prSidStd[i][j] = Math.sqrt(
            Number(prSidDevTotal[i][j] / sidSize[i][j])
          ).toFixed(4);
          issueSidStd[i][j] = Math.sqrt(
            Number(issueSidDevTotal[i][j] / sidSize[i][j])
          ).toFixed(4);
        }
      }
      for (let i = 0; i < nowYear - startYear + 1; i++) {
        for (let j = 0; j < 3; j++) {
          scoreDeptStd[i][j] = Math.sqrt(
            Number(scoreDeptDevTotal[i][j] / deptSize[i][j])
          ).toFixed(4);
          commitDeptStd[i][j] = Math.sqrt(
            Number(commitDeptDevTotal[i][j] / deptSize[i][j])
          ).toFixed(4);
          starDeptStd[i][j] = Math.sqrt(
            Number(starDeptDevTotal[i][j] / deptSize[i][j])
          ).toFixed(4);
          prDeptStd[i][j] = Math.sqrt(
            Number(prDeptDevTotal[i][j] / deptSize[i][j])
          ).toFixed(4);
          issueDeptStd[i][j] = Math.sqrt(
            Number(issueDeptDevTotal[i][j] / deptSize[i][j])
          ).toFixed(4);
        }
      }
      for (let i = 0; i < nowYear - startYear + 1; i++) {
        scoreYearStd[i] = Math.sqrt(
          Number(scoreYearDevTotal[i] / annualCnt[i])
        ).toFixed(4);
        commitYearStd[i] = Math.sqrt(
          Number(commitYearDevTotal[i] / annualCnt[i])
        ).toFixed(4);
        starYearStd[i] = Math.sqrt(
          Number(starYearDevTotal[i] / annualCnt[i])
        ).toFixed(4);
        prYearStd[i] = Math.sqrt(
          Number(prYearDevTotal[i] / annualCnt[i])
        ).toFixed(4);
        issueYearStd[i] = Math.sqrt(
          Number(issueYearDevTotal[i] / annualCnt[i])
        ).toFixed(4);
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
              score: scoreMean,
              commit: commitMean,
              star: starMean,
              pr: prMean,
              issue: issueMean,
              scoreStd: scoreYearStd,
              commitStd: commitYearStd,
              starStd: starYearStd,
              prStd: prYearStd,
              issueStd: issueYearStd,
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
              scoreDeptStd: scoreDeptStd[0],
              scoreSidStd: scoreSidStd[0],
              commitDeptStd: commitDeptStd[0],
              commitSidStd: commitSidStd[0],
              starDeptStd: starDeptStd[0],
              starSidStd: starSidStd[0],
              prDeptStd: prDeptStd[0],
              prSidStd: prSidStd[0],
              issueDeptStd: issueDeptStd[0],
              issueSidStd: issueSidStd[0],
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
              scoreDeptStd: scoreDeptStd[1],
              scoreSidStd: scoreSidStd[1],
              commitDeptStd: commitDeptStd[1],
              commitSidStd: commitSidStd[1],
              starDeptStd: starDeptStd[1],
              starSidStd: starSidStd[1],
              prDeptStd: prDeptStd[1],
              prSidStd: prSidStd[1],
              issueDeptStd: issueDeptStd[1],
              issueSidStd: issueSidStd[1],
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
              scoreDeptStd: scoreDeptStd[2],
              scoreSidStd: scoreSidStd[2],
              commitDeptStd: commitDeptStd[2],
              commitSidStd: commitSidStd[2],
              starDeptStd: starDeptStd[2],
              starSidStd: starSidStd[2],
              prDeptStd: prDeptStd[2],
              prSidStd: prSidStd[2],
              issueDeptStd: issueDeptStd[2],
              issueSidStd: issueSidStd[2],
            },

            size: annualCnt,
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
