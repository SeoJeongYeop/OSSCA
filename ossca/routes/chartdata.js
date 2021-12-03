const express = require("express");
const router = express.Router();
const DB = require("./database");

router.get("/", (req, res, next) => {
  let query = `SELECT gs.github_id, gs.year, gs.excellent_contributor, 
round(gs.guideline_score+gs.code_score+gs.other_project_score,1) as owner_score, 
gs.contributor_score, round(gs.star_score+gs.contribution_score,1) as additional_score,  
gs.best_repo, gs.star_count, gs.commit_count, st.id, st.dept,
gs.star_owner_count, gs.fork_owner_count, 
least(round(gs.repo_score_sub+gs.additional_score_sub,3), 5) as total_score_sub, 
least(round(gs.repo_score_sub+gs.additional_score_sum,3), 5) as total_score_sum
FROM github_score as gs JOIN student_tab as st ON gs.github_id = st.github_id;`;

  console.log(query);
  let repoQuery = `select grs.github_id, grs.create_date from github_repo_stats as grs;`;
  DB("GET", query, []).then(function (result, error) {
    if (error) {
      console.log(error);
    }
    const studentData = [[], [], []];
    const studentRepo = [{}, {}, {}];
    const startYear = 2019;
    const nowYear = 2021;
    let deptDict = { 소프트웨어학과: 0, 글로벌융합학부: 1, 컴퓨터공학과: 2 };
    /* Year Data: Mean, Var, Std*/
    let scoreAnnual = [0, 0, 0];
    let scoreSubAnnual = [0, 0, 0];
    let scoreSumAnnual = [0, 0, 0];
    let commitAnnual = [0, 0, 0];
    let starAnnual = [0, 0, 0];
    let prAnnual = [0, 0, 0];
    let issueAnnual = [0, 0, 0];
    let forkAnnual = [0, 0, 0];

    /* Overview Data */
    let scoreMore3 = [0, 0, 0];
    let scoreSubMore3 = [0, 0, 0];
    let scoreSumMore3 = [0, 0, 0];
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
    // About Score sub
    let scoreSubDist = create2DArray(3, 10);
    let scoreSubDept = create2DArray(3, 3);
    let scoreSubSid = create2DArray(3, 7);
    // About Score sub
    let scoreSumDist = create2DArray(3, 10);
    let scoreSumDept = create2DArray(3, 3);
    let scoreSumSid = create2DArray(3, 7);
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
    // About Forks
    let forkDist = create2DArray(3, 5);
    let forkDept = create2DArray(3, 3);
    let forkSid = create2DArray(3, 7);

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
        studentData[idx1].push({
          github_id: Row["github_id"],
          score: Row.total_score,
          score_sub: String(Row.total_score_sub),
          score_sum: String(Row.total_score_sum),
          commit: Row["commit_count"],
          star: Row["star_count"],
          pr: Row["pr_count"],
          issue: Row["issue_count"],
          fork: Row["fork_owner_count"],
        });
        /* student id */
        scoreSid[idx1][idxId] += Number(Row.total_score);
        scoreSubSid[idx1][idxId] += Number(Row.total_score_sub);
        scoreSumSid[idx1][idxId] += Number(Row.total_score_sum);
        commitSid[idx1][idxId] += Row.commit_count;
        starSid[idx1][idxId] += Row.star_count;
        prSid[idx1][idxId] += Row.pr_count;
        issueSid[idx1][idxId] += Row.issue_count;
        forkSid[idx1][idxId] += Row.fork_owner_count;
        sidSize[idx1][idxId] += 1;
        /* dept */
        scoreDept[idx1][idxDept] += Number(Row.total_score);
        scoreSubDept[idx1][idxDept] += Number(Row.total_score_sub);
        scoreSumDept[idx1][idxDept] += Number(Row.total_score_sum);
        commitDept[idx1][idxDept] += Row.commit_count;
        starDept[idx1][idxDept] += Row.star_count;
        prDept[idx1][idxDept] += Row.pr_count;
        issueDept[idx1][idxDept] += Row.issue_count;
        forkDept[idx1][idxDept] += Row.fork_owner_count;
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
        if (Row.total_score_sub < 0.5) {
          scoreSubDist[idx1][0] += 1;
        } else if (Row.total_score_sub < 1) {
          scoreSubDist[idx1][1] += 1;
        } else if (Row.total_score_sub < 1.5) {
          scoreSubDist[idx1][2] += 1;
        } else if (Row.total_score_sub < 2) {
          scoreSubDist[idx1][3] += 1;
        } else if (Row.total_score_sub < 2.5) {
          scoreSubDist[idx1][4] += 1;
        } else if (Row.total_score_sub < 3) {
          scoreSubDist[idx1][5] += 1;
        } else if (Row.total_score < 3.5) {
          scoreSubDist[idx1][6] += 1;
          scoreSubMore3[idx1] += 1;
        } else if (Row.total_score_sub < 4) {
          scoreSubDist[idx1][7] += 1;
          scoreSubMore3[idx1] += 1;
        } else if (Row.total_score_sub < 4.5) {
          scoreSubDist[idx1][8] += 1;
          scoreSubMore3[idx1] += 1;
        } else if (Row.total_score_sub >= 4.5) {
          scoreSubDist[idx1][9] += 1;
          scoreSubMore3[idx1] += 1;
        }
        if (Row.total_score_sum < 0.5) {
          scoreSumDist[idx1][0] += 1;
        } else if (Row.total_score_sum < 1) {
          scoreSumDist[idx1][1] += 1;
        } else if (Row.total_score_sum < 1.5) {
          scoreSumDist[idx1][2] += 1;
        } else if (Row.total_score_sum < 2) {
          scoreSumDist[idx1][3] += 1;
        } else if (Row.total_score_sum < 2.5) {
          scoreSumDist[idx1][4] += 1;
        } else if (Row.total_score_sum < 3) {
          scoreSumDist[idx1][5] += 1;
        } else if (Row.total_score < 3.5) {
          scoreSumDist[idx1][6] += 1;
          scoreSumMore3[idx1] += 1;
        } else if (Row.total_score_sum < 4) {
          scoreSumDist[idx1][7] += 1;
          scoreSumMore3[idx1] += 1;
        } else if (Row.total_score_sum < 4.5) {
          scoreSumDist[idx1][8] += 1;
          scoreSumMore3[idx1] += 1;
        } else if (Row.total_score_sum >= 4.5) {
          scoreSumDist[idx1][9] += 1;
          scoreSumMore3[idx1] += 1;
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
        if (Row.fork_owner_count < 1) {
          forkDist[idx1][0] += 1;
        } else if (Row.fork_owner_count < 2) {
          forkDist[idx1][1] += 1;
        } else if (Row.fork_owner_count < 3) {
          forkDist[idx1][2] += 1;
        } else if (Row.fork_owner_count < 4) {
          forkDist[idx1][3] += 1;
        } else if (Row.fork_owner_count >= 4) {
          forkDist[idx1][4] += 1;
        }
        // annual Total sum
        scoreAnnual[idx1] += Number(Row.total_score);
        scoreSubAnnual[idx1] += Number(Row.total_score_sub);
        scoreSumAnnual[idx1] += Number(Row.total_score_sum);
        commitAnnual[idx1] += Row.commit_count;
        starAnnual[idx1] += Row.star_count;
        prAnnual[idx1] += Row.pr_count;
        issueAnnual[idx1] += Row.issue_count;
        forkAnnual[idx1] += Row.fork_owner_count;
        annualCnt[idx1] += 1;
      }

      /* 상위 5%의 데이터 셋 만들기 */
      let scoreSidTop5pct = create2DArray_a(3, 7);
      let scoreDeptTop5pct = create2DArray_a(3, 3);
      let scoreSubSidTop5pct = create2DArray_a(3, 7);
      let scoreSubDeptTop5pct = create2DArray_a(3, 3);
      let scoreSumSidTop5pct = create2DArray_a(3, 7);
      let scoreSumDeptTop5pct = create2DArray_a(3, 3);
      let commitSidTop5pct = create2DArray_a(3, 7);
      let commitDeptTop5pct = create2DArray_a(3, 3);
      let starSidTop5pct = create2DArray_a(3, 7);
      let starDeptTop5pct = create2DArray_a(3, 3);
      let prSidTop5pct = create2DArray_a(3, 7);
      let prDeptTop5pct = create2DArray_a(3, 3);
      let issueSidTop5pct = create2DArray_a(3, 7);
      let issueDeptTop5pct = create2DArray_a(3, 3);
      let forkSidTop5pct = create2DArray_a(3, 7);
      let forkDeptTop5pct = create2DArray_a(3, 3);

      for (let i = 0; i < result.row.length; i++) {
        Row = result.row[i];
        idx1 = Row.year - startYear;
        idxId = nowYear - Math.floor(Row.id / 1000000);
        idxDept = deptDict[Row.dept];
        let sidmax = parseInt((sidSize[idx1][idxId] * 5) / 100) + 1;
        let deptmax = parseInt((deptSize[idx1][idxDept] * 5) / 100) + 1;
        /** score */
        // student id
        if (
          sidmax > scoreSidTop5pct[idx1][idxId].length &&
          Row.total_score > 0
        ) {
          if (Row.total_score < scoreSidTop5pct[idx1][idxId][0]) {
            scoreSidTop5pct[idx1][idxId].unshift(Row.total_score);
          } else {
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (scoreSidTop5pct[idx1][idxId][p] > Row.total_score) {
                break;
              }
            }
            scoreSidTop5pct[idx1][idxId].splice(p, 0, Row.total_score);
          }
        } else {
          if (Row.total_score > scoreSidTop5pct[idx1][idxId][sidmax]) {
            scoreSidTop5pct[idx1][idxId].shift();
            scoreSidTop5pct[idx1][idxId].push(Row.total_score);
          } else if (Row.total_score > scoreSidTop5pct[idx1][idxId][0]) {
            scoreSidTop5pct[idx1][idxId].shift();
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (scoreSidTop5pct[idx1][idxId][p] > Row.total_score) {
                break;
              }
            }
            scoreSidTop5pct[idx1][idxId].splice(p, 0, Row.total_score);
          }
        }
        // department
        if (
          deptmax > scoreDeptTop5pct[idx1][idxDept].length &&
          Row.total_score > 0
        ) {
          if (Row.total_score < scoreDeptTop5pct[idx1][idxDept][0]) {
            scoreDeptTop5pct[idx1][idxDept].unshift(Row.total_score);
          } else {
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (scoreDeptTop5pct[idx1][idxDept][p] > Row.total_score) {
                break;
              }
            }
            scoreDeptTop5pct[idx1][idxDept].splice(p, 0, Row.total_score);
          }
        } else {
          if (Row.total_score > scoreDeptTop5pct[idx1][idxDept][deptmax]) {
            scoreDeptTop5pct[idx1][idxDept].shift();
            scoreDeptTop5pct[idx1][idxDept].push(Row.total_score);
          } else if (Row.total_score > scoreDeptTop5pct[idx1][idxDept][0]) {
            scoreDeptTop5pct[idx1][idxDept].shift();
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (scoreDeptTop5pct[idx1][idxDept][p] > Row.total_score) {
                break;
              }
            }
            scoreDeptTop5pct[idx1][idxDept].splice(p, 0, Row.total_score);
          }
        }
        /** score sub */
        // student id
        if (
          sidmax > scoreSubSidTop5pct[idx1][idxId].length &&
          Row.total_score_sub > 0
        ) {
          if (Row.total_score_sub < scoreSubSidTop5pct[idx1][idxId][0]) {
            scoreSubSidTop5pct[idx1][idxId].unshift(Row.total_score_sub);
          } else {
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (scoreSubSidTop5pct[idx1][idxId][p] > Row.total_score_sub) {
                break;
              }
            }
            scoreSubSidTop5pct[idx1][idxId].splice(p, 0, Row.total_score_sub);
          }
        } else {
          if (Row.total_score_sub > scoreSubSidTop5pct[idx1][idxId][sidmax]) {
            scoreSubSidTop5pct[idx1][idxId].shift();
            scoreSubSidTop5pct[idx1][idxId].push(Row.total_score_sub);
          } else if (Row.total_score_sub > scoreSubSidTop5pct[idx1][idxId][0]) {
            scoreSubSidTop5pct[idx1][idxId].shift();
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (scoreSubSidTop5pct[idx1][idxId][p] > Row.total_score_sub) {
                break;
              }
            }
            scoreSubSidTop5pct[idx1][idxId].splice(p, 0, Row.total_score_sub);
          }
        }
        // department
        if (
          deptmax > scoreSubDeptTop5pct[idx1][idxDept].length &&
          Row.total_score_sub > 0
        ) {
          if (Row.total_score_sub < scoreSubDeptTop5pct[idx1][idxDept][0]) {
            scoreSubDeptTop5pct[idx1][idxDept].unshift(Row.total_score_sub);
          } else {
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (scoreSubDeptTop5pct[idx1][idxDept][p] > Row.total_score_sub) {
                break;
              }
            }
            scoreSubDeptTop5pct[idx1][idxDept].splice(
              p,
              0,
              Row.total_score_sub
            );
          }
        } else {
          if (
            Row.total_score_sub > scoreSubDeptTop5pct[idx1][idxDept][deptmax]
          ) {
            scoreSubDeptTop5pct[idx1][idxDept].shift();
            scoreSubDeptTop5pct[idx1][idxDept].push(Row.total_score_sub);
          } else if (
            Row.total_score_sub > scoreSubDeptTop5pct[idx1][idxDept][0]
          ) {
            scoreSubDeptTop5pct[idx1][idxDept].shift();
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (scoreSubDeptTop5pct[idx1][idxDept][p] > Row.total_score_sub) {
                break;
              }
            }
            scoreSubDeptTop5pct[idx1][idxDept].splice(
              p,
              0,
              Row.total_score_sub
            );
          }
        }

        /** score sum */
        // student id
        if (
          sidmax > scoreSumSidTop5pct[idx1][idxId].length &&
          Row.total_score_sum > 0
        ) {
          if (Row.total_score_sum < scoreSumSidTop5pct[idx1][idxId][0]) {
            scoreSumSidTop5pct[idx1][idxId].unshift(Row.total_score_sum);
          } else {
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (scoreSumSidTop5pct[idx1][idxId][p] > Row.total_score_sum) {
                break;
              }
            }
            scoreSumSidTop5pct[idx1][idxId].splice(p, 0, Row.total_score_sum);
          }
        } else {
          if (Row.total_score_sum > scoreSumSidTop5pct[idx1][idxId][sidmax]) {
            scoreSumSidTop5pct[idx1][idxId].shift();
            scoreSumSidTop5pct[idx1][idxId].push(Row.total_score_sum);
          } else if (Row.total_score_sum > scoreSumSidTop5pct[idx1][idxId][0]) {
            scoreSumSidTop5pct[idx1][idxId].shift();
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (scoreSumSidTop5pct[idx1][idxId][p] > Row.total_score_sum) {
                break;
              }
            }
            scoreSumSidTop5pct[idx1][idxId].splice(p, 0, Row.total_score_sum);
          }
        }
        // department
        if (
          deptmax > scoreSumDeptTop5pct[idx1][idxDept].length &&
          Row.total_score_sum > 0
        ) {
          if (Row.total_score_sum < scoreSumDeptTop5pct[idx1][idxDept][0]) {
            scoreSumDeptTop5pct[idx1][idxDept].unshift(Row.total_score_sum);
          } else {
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (scoreSumDeptTop5pct[idx1][idxDept][p] > Row.total_score_sum) {
                break;
              }
            }
            scoreSumDeptTop5pct[idx1][idxDept].splice(
              p,
              0,
              Row.total_score_sum
            );
          }
        } else {
          if (
            Row.total_score_sum > scoreSumDeptTop5pct[idx1][idxDept][deptmax]
          ) {
            scoreSumDeptTop5pct[idx1][idxDept].shift();
            scoreSumDeptTop5pct[idx1][idxDept].push(Row.total_score_sum);
          } else if (
            Row.total_score_sum > scoreSumDeptTop5pct[idx1][idxDept][0]
          ) {
            scoreSumDeptTop5pct[idx1][idxDept].shift();
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (scoreSumDeptTop5pct[idx1][idxDept][p] > Row.total_score_sum) {
                break;
              }
            }
            scoreSumDeptTop5pct[idx1][idxDept].splice(
              p,
              0,
              Row.total_score_sum
            );
          }
        }
        /** commit */
        // student id
        if (
          sidmax > commitSidTop5pct[idx1][idxId].length &&
          Row.commit_count > 0
        ) {
          if (Row.commit_count < commitSidTop5pct[idx1][idxId][0]) {
            commitSidTop5pct[idx1][idxId].unshift(Row.commit_count);
          } else {
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (commitSidTop5pct[idx1][idxId][p] > Row.commit_count) {
                break;
              }
            }
            commitSidTop5pct[idx1][idxId].splice(p, 0, Row.commit_count);
          }
        } else {
          if (Row.commit_count > commitSidTop5pct[idx1][idxId][sidmax]) {
            commitSidTop5pct[idx1][idxId].shift();
            commitSidTop5pct[idx1][idxId].push(Row.commit_count);
          } else if (Row.commit_count > commitSidTop5pct[idx1][idxId][0]) {
            commitSidTop5pct[idx1][idxId].shift();
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (commitSidTop5pct[idx1][idxId][p] > Row.commit_count) {
                break;
              }
            }
            commitSidTop5pct[idx1][idxId].splice(p, 0, Row.commit_count);
          }
        }
        // department
        if (
          deptmax > commitDeptTop5pct[idx1][idxDept].length &&
          Row.commit_count > 0
        ) {
          if (Row.commit_count < commitDeptTop5pct[idx1][idxDept][0]) {
            commitDeptTop5pct[idx1][idxDept].unshift(Row.commit_count);
          } else {
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (commitDeptTop5pct[idx1][idxDept][p] > Row.commit_count) {
                break;
              }
            }
            commitDeptTop5pct[idx1][idxDept].splice(p, 0, Row.commit_count);
          }
        } else {
          if (Row.commit_count > commitDeptTop5pct[idx1][idxDept][deptmax]) {
            commitDeptTop5pct[idx1][idxDept].shift();
            commitDeptTop5pct[idx1][idxDept].push(Row.commit_count);
          } else if (Row.commit_count > commitDeptTop5pct[idx1][idxDept][0]) {
            commitDeptTop5pct[idx1][idxDept].shift();
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (commitDeptTop5pct[idx1][idxDept][p] > Row.commit_count) {
                break;
              }
            }
            commitDeptTop5pct[idx1][idxDept].splice(p, 0, Row.commit_count);
          }
        }

        /** star */
        // student id
        if (sidmax > starSidTop5pct[idx1][idxId].length && Row.star_count > 0) {
          if (Row.star_count < starSidTop5pct[idx1][idxId][0]) {
            starSidTop5pct[idx1][idxId].unshift(Row.star_count);
          } else {
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (starSidTop5pct[idx1][idxId][p] > Row.star_count) {
                break;
              }
            }
            starSidTop5pct[idx1][idxId].splice(p, 0, Row.star_count);
          }
        } else {
          if (Row.star_count > starSidTop5pct[idx1][idxId][sidmax]) {
            starSidTop5pct[idx1][idxId].shift();
            starSidTop5pct[idx1][idxId].push(Row.star_count);
          } else if (Row.star_count > starSidTop5pct[idx1][idxId][0]) {
            starSidTop5pct[idx1][idxId].shift();
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (starSidTop5pct[idx1][idxId][p] > Row.star_count) {
                break;
              }
            }
            starSidTop5pct[idx1][idxId].splice(p, 0, Row.star_count);
          }
        }
        // department
        if (
          deptmax > starDeptTop5pct[idx1][idxDept].length &&
          Row.star_count > 0
        ) {
          if (Row.star_count < starDeptTop5pct[idx1][idxDept][0]) {
            starDeptTop5pct[idx1][idxDept].unshift(Row.star_count);
          } else {
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (starDeptTop5pct[idx1][idxDept][p] > Row.star_count) {
                break;
              }
            }
            starDeptTop5pct[idx1][idxDept].splice(p, 0, Row.star_count);
          }
        } else {
          if (Row.star_count > starDeptTop5pct[idx1][idxDept][deptmax]) {
            starDeptTop5pct[idx1][idxDept].shift();
            starDeptTop5pct[idx1][idxDept].push(Row.star_count);
          } else if (Row.star_count > starDeptTop5pct[idx1][idxDept][0]) {
            starDeptTop5pct[idx1][idxDept].shift();
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (starDeptTop5pct[idx1][idxDept][p] > Row.star_count) {
                break;
              }
            }
            starDeptTop5pct[idx1][idxDept].splice(p, 0, Row.star_count);
          }
        }

        /** prs */
        // student id
        if (sidmax > prSidTop5pct[idx1][idxId].length && Row.pr_count > 0) {
          if (Row.pr_count < prSidTop5pct[idx1][idxId][0]) {
            prSidTop5pct[idx1][idxId].unshift(Row.pr_count);
          } else {
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (prSidTop5pct[idx1][idxId][p] > Row.pr_count) {
                break;
              }
            }
            prSidTop5pct[idx1][idxId].splice(p, 0, Row.pr_count);
          }
        } else {
          if (Row.pr_count > prSidTop5pct[idx1][idxId][sidmax]) {
            prSidTop5pct[idx1][idxId].shift();
            prSidTop5pct[idx1][idxId].push(Row.pr_count);
          } else if (Row.pr_count > prSidTop5pct[idx1][idxId][0]) {
            prSidTop5pct[idx1][idxId].shift();
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (prSidTop5pct[idx1][idxId][p] > Row.pr_count) {
                break;
              }
            }
            prSidTop5pct[idx1][idxId].splice(p, 0, Row.pr_count);
          }
        }
        // department
        if (deptmax > prDeptTop5pct[idx1][idxDept].length && Row.pr_count > 0) {
          if (Row.pr_count < prDeptTop5pct[idx1][idxDept][0]) {
            prDeptTop5pct[idx1][idxDept].unshift(Row.pr_count);
          } else {
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (prDeptTop5pct[idx1][idxDept][p] > Row.pr_count) {
                break;
              }
            }
            prDeptTop5pct[idx1][idxDept].splice(p, 0, Row.pr_count);
          }
        } else {
          if (Row.pr_count > prDeptTop5pct[idx1][idxDept][deptmax]) {
            prDeptTop5pct[idx1][idxDept].shift();
            prDeptTop5pct[idx1][idxDept].push(Row.pr_count);
          } else if (Row.pr_count > prDeptTop5pct[idx1][idxDept][0]) {
            prDeptTop5pct[idx1][idxDept].shift();
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (prDeptTop5pct[idx1][idxDept][p] > Row.pr_count) {
                break;
              }
            }
            prDeptTop5pct[idx1][idxDept].splice(p, 0, Row.pr_count);
          }
        }
        /** issue */
        // student id
        if (
          sidmax > issueSidTop5pct[idx1][idxId].length &&
          Row.issue_count > 0
        ) {
          if (Row.issue_count < issueSidTop5pct[idx1][idxId][0]) {
            issueSidTop5pct[idx1][idxId].unshift(Row.issue_count);
          } else {
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (issueSidTop5pct[idx1][idxId][p] > Row.issue_count) {
                break;
              }
            }
            issueSidTop5pct[idx1][idxId].splice(p, 0, Row.issue_count);
          }
        } else {
          if (Row.issue_count > issueSidTop5pct[idx1][idxId][sidmax]) {
            issueSidTop5pct[idx1][idxId].shift();
            issueSidTop5pct[idx1][idxId].push(Row.issue_count);
          } else if (Row.issue_count > issueSidTop5pct[idx1][idxId][0]) {
            issueSidTop5pct[idx1][idxId].shift();
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (issueSidTop5pct[idx1][idxId][p] > Row.issue_count) {
                break;
              }
            }
            issueSidTop5pct[idx1][idxId].splice(p, 0, Row.issue_count);
          }
        }
        // department
        if (
          deptmax > issueDeptTop5pct[idx1][idxDept].length &&
          Row.issue_count > 0
        ) {
          if (Row.issue_count < issueDeptTop5pct[idx1][idxDept][0]) {
            issueDeptTop5pct[idx1][idxDept].unshift(Row.issue_count);
          } else {
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (issueDeptTop5pct[idx1][idxDept][p] > Row.issue_count) {
                break;
              }
            }
            issueDeptTop5pct[idx1][idxDept].splice(p, 0, Row.issue_count);
          }
        } else {
          if (Row.issue_count > issueDeptTop5pct[idx1][idxDept][deptmax]) {
            issueDeptTop5pct[idx1][idxDept].shift();
            issueDeptTop5pct[idx1][idxDept].push(Row.issue_count);
          } else if (Row.issue_count > issueDeptTop5pct[idx1][idxDept][0]) {
            issueDeptTop5pct[idx1][idxDept].shift();
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (issueDeptTop5pct[idx1][idxDept][p] > Row.issue_count) {
                break;
              }
            }
            issueDeptTop5pct[idx1][idxDept].splice(p, 0, Row.issue_count);
          }
        }
        /** fork */
        // student id
        if (
          sidmax > forkSidTop5pct[idx1][idxId].length &&
          Row.fork_owner_count > 0
        ) {
          if (Row.fork_owner_count < forkSidTop5pct[idx1][idxId][0]) {
            forkSidTop5pct[idx1][idxId].unshift(Row.fork_owner_count);
          } else {
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (forkSidTop5pct[idx1][idxId][p] > Row.fork_owner_count) {
                break;
              }
            }
            forkSidTop5pct[idx1][idxId].splice(p, 0, Row.fork_owner_count);
          }
        } else {
          if (Row.fork_owner_count > forkSidTop5pct[idx1][idxId][sidmax]) {
            forkSidTop5pct[idx1][idxId].shift();
            forkSidTop5pct[idx1][idxId].push(Row.fork_owner_count);
          } else if (Row.fork_owner_count > forkSidTop5pct[idx1][idxId][0]) {
            forkSidTop5pct[idx1][idxId].shift();
            let p = 0;
            for (p = 0; p < sidmax; p++) {
              if (forkSidTop5pct[idx1][idxId][p] > Row.fork_owner_count) {
                break;
              }
            }
            forkSidTop5pct[idx1][idxId].splice(p, 0, Row.fork_owner_count);
          }
        }
        // department
        if (
          deptmax > forkDeptTop5pct[idx1][idxDept].length &&
          Row.fork_owner_count > 0
        ) {
          if (Row.fork_owner_count < forkDeptTop5pct[idx1][idxDept][0]) {
            forkDeptTop5pct[idx1][idxDept].unshift(Row.fork_owner_count);
          } else {
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (forkDeptTop5pct[idx1][idxDept][p] > Row.fork_owner_count) {
                break;
              }
            }
            forkDeptTop5pct[idx1][idxDept].splice(p, 0, Row.fork_owner_count);
          }
        } else {
          if (Row.fork_owner_count > forkDeptTop5pct[idx1][idxDept][deptmax]) {
            forkDeptTop5pct[idx1][idxDept].shift();
            forkDeptTop5pct[idx1][idxDept].push(Row.fork_owner_count);
          } else if (Row.fork_owner_count > forkDeptTop5pct[idx1][idxDept][0]) {
            forkDeptTop5pct[idx1][idxDept].shift();
            let p = 0;
            for (p = 0; p < deptmax; p++) {
              if (forkDeptTop5pct[idx1][idxDept][p] > Row.fork_owner_count) {
                break;
              }
            }
            forkDeptTop5pct[idx1][idxDept].splice(p, 0, Row.fork_owner_count);
          }
        }
      }

      /* 학번 평균, 학과 평균 구하기 */
      // object 타입으로 map함수 사용불가
      for (let i = 0; i < nowYear - startYear + 1; i++) {
        for (let j = 0; j < scoreSid[i].length; j++) {
          scoreSid[i][j] = (scoreSid[i][j] / sidSize[i][j]).toFixed(2);
          scoreSubSid[i][j] = (scoreSubSid[i][j] / sidSize[i][j]).toFixed(2);
          scoreSumSid[i][j] = (scoreSumSid[i][j] / sidSize[i][j]).toFixed(2);
          commitSid[i][j] = (commitSid[i][j] / sidSize[i][j]).toFixed(1);
          starSid[i][j] = (starSid[i][j] / sidSize[i][j]).toFixed(2);
          prSid[i][j] = (prSid[i][j] / sidSize[i][j]).toFixed(2);
          issueSid[i][j] = (issueSid[i][j] / sidSize[i][j]).toFixed(2);
          forkSid[i][j] = (forkSid[i][j] / sidSize[i][j]).toFixed(2);
        }
      }

      for (let i = 0; i < nowYear - startYear + 1; i++) {
        for (let j = 0; j < scoreDept[i].length; j++) {
          scoreDept[i][j] = (scoreDept[i][j] / deptSize[i][j]).toFixed(2);
          scoreSubDept[i][j] = (scoreSubDept[i][j] / deptSize[i][j]).toFixed(2);
          scoreSumDept[i][j] = (scoreSumDept[i][j] / deptSize[i][j]).toFixed(2);
          commitDept[i][j] = (commitDept[i][j] / deptSize[i][j]).toFixed(1);
          starDept[i][j] = (starDept[i][j] / deptSize[i][j]).toFixed(2);
          prDept[i][j] = (prDept[i][j] / deptSize[i][j]).toFixed(2);
          issueDept[i][j] = (issueDept[i][j] / deptSize[i][j]).toFixed(2);
          forkDept[i][j] = (forkDept[i][j] / deptSize[i][j]).toFixed(2);
        }
      }

      // 연도별 점수, 커밋, 스타, pr, issue 평균 계산
      let scoreMean = calculateMeanOfArray(scoreAnnual);
      let scoreSubMean = calculateMeanOfArray(scoreSubAnnual);
      let scoreSumMean = calculateMeanOfArray(scoreSumAnnual);
      let commitMean = calculateMeanOfArray(commitAnnual);
      let starMean = calculateMeanOfArray(starAnnual);
      let prMean = calculateMeanOfArray(prAnnual);
      let issueMean = calculateMeanOfArray(issueAnnual);
      let forkMean = calculateMeanOfArray(forkAnnual);

      function calculateMeanOfArray(arr) {
        return arr.map((val, idx) => {
          return (val / annualCnt[idx]).toFixed(2);
        });
      }

      /* 학번별, 학과별, 연도별에 대해 점수, 커밋, 스타, 풀리, 이슈 등 각각의 분산과 표준편차 계산 */
      const scoreSidDevTotal = create2DArray(3, 7);
      const scoreSubSidDevTotal = create2DArray(3, 7);
      const scoreSumSidDevTotal = create2DArray(3, 7);
      const commitSidDevTotal = create2DArray(3, 7);
      const starSidDevTotal = create2DArray(3, 7);
      const prSidDevTotal = create2DArray(3, 7);
      const issueSidDevTotal = create2DArray(3, 7);
      const forkSidDevTotal = create2DArray(3, 7);
      const scoreDeptDevTotal = create2DArray(3, 3);
      const scoreSubDeptDevTotal = create2DArray(3, 3);
      const scoreSumDeptDevTotal = create2DArray(3, 3);
      const commitDeptDevTotal = create2DArray(3, 3);
      const starDeptDevTotal = create2DArray(3, 3);
      const prDeptDevTotal = create2DArray(3, 3);
      const issueDeptDevTotal = create2DArray(3, 3);
      const forkDeptDevTotal = create2DArray(3, 3);
      const scoreYearDevTotal = [0, 0, 0];
      const scoreSubYearDevTotal = [0, 0, 0];
      const scoreSumYearDevTotal = [0, 0, 0];
      const commitYearDevTotal = [0, 0, 0];
      const starYearDevTotal = [0, 0, 0];
      const prYearDevTotal = [0, 0, 0];
      const issueYearDevTotal = [0, 0, 0];
      const forkYearDevTotal = [0, 0, 0];

      for (i = 0; i < result.row.length; i++) {
        Row = result.row[i];
        idx1 = Row.year - startYear;

        /* student id */
        idxId = nowYear - Math.floor(Row.id / 1000000);
        scoreSidDevTotal[idx1][idxId] += Math.pow(
          Number(Row.total_score) - Number(scoreSid[idx1][idxId]),
          2
        );
        scoreSubSidDevTotal[idx1][idxId] += Math.pow(
          Number(Row.total_score_sub) - Number(scoreSubSid[idx1][idxId]),
          2
        );
        scoreSumSidDevTotal[idx1][idxId] += Math.pow(
          Number(Row.total_score_sum) - Number(scoreSumSid[idx1][idxId]),
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
        forkSidDevTotal[idx1][idxId] += Math.pow(
          Number(Row.fork_owner_count) - Number(forkSid[idx1][idxId]),
          2
        );

        /* dept */
        idxDept = deptDict[Row.dept];
        scoreDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.total_score) - scoreDept[idx1][idxDept],
          2
        );
        scoreSubDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.total_score_sub) - scoreSubDept[idx1][idxDept],
          2
        );
        scoreSumDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.total_score_sum) - scoreSumDept[idx1][idxDept],
          2
        );
        commitDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.commit_count - commitDept[idx1][idxDept]),
          2
        );
        starDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.star_count - starDept[idx1][idxDept]),
          2
        );
        prDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.pr_count - prDept[idx1][idxDept]),
          2
        );
        issueDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.issue_count - issueDept[idx1][idxDept]),
          2
        );
        forkDeptDevTotal[idx1][idxDept] += Math.pow(
          Number(Row.fork_owner_count - forkDept[idx1][idxDept]),
          2
        );
        /* year */
        scoreYearDevTotal[idx1] += Math.pow(
          Number(Row.total_score) - scoreMean[idx1],
          2
        );
        scoreSubYearDevTotal[idx1] += Math.pow(
          Number(Row.total_score_sub) - scoreSubMean[idx1],
          2
        );
        scoreSumYearDevTotal[idx1] += Math.pow(
          Number(Row.total_score_sum) - scoreSumMean[idx1],
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
        forkYearDevTotal[idx1] += Math.pow(
          Number(Row.fork_owner_count - forkMean[idx1]),
          2
        );
      }

      const scoreSidStd = create2DArray(3, 7);
      const scoreSubSidStd = create2DArray(3, 7);
      const scoreSumSidStd = create2DArray(3, 7);
      const commitSidStd = create2DArray(3, 7);
      const starSidStd = create2DArray(3, 7);
      const prSidStd = create2DArray(3, 7);
      const issueSidStd = create2DArray(3, 7);
      const forkSidStd = create2DArray(3, 7);
      const scoreDeptStd = create2DArray(3, 3);
      const scoreSubDeptStd = create2DArray(3, 3);
      const scoreSumDeptStd = create2DArray(3, 3);
      const commitDeptStd = create2DArray(3, 3);
      const starDeptStd = create2DArray(3, 3);
      const prDeptStd = create2DArray(3, 3);
      const issueDeptStd = create2DArray(3, 3);
      const forkDeptStd = create2DArray(3, 3);
      const scoreYearStd = [0, 0, 0];
      const scoreSubYearStd = [0, 0, 0];
      const scoreSumYearStd = [0, 0, 0];
      const commitYearStd = [0, 0, 0];
      const starYearStd = [0, 0, 0];
      const prYearStd = [0, 0, 0];
      const issueYearStd = [0, 0, 0];
      const forkYearStd = [0, 0, 0];

      for (let i = 0; i < nowYear - startYear + 1; i++) {
        for (let j = 0; j < 7; j++) {
          scoreSidStd[i][j] = Math.sqrt(
            Number(scoreSidDevTotal[i][j] / sidSize[i][j])
          ).toFixed(4);
          scoreSubSidStd[i][j] = Math.sqrt(
            Number(scoreSubSidDevTotal[i][j] / sidSize[i][j])
          ).toFixed(4);
          scoreSumSidStd[i][j] = Math.sqrt(
            Number(scoreSumSidDevTotal[i][j] / sidSize[i][j])
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
          forkSidStd[i][j] = Math.sqrt(
            Number(forkSidDevTotal[i][j] / sidSize[i][j])
          ).toFixed(4);
        }
      }
      for (let i = 0; i < nowYear - startYear + 1; i++) {
        for (let j = 0; j < 3; j++) {
          scoreDeptStd[i][j] = Math.sqrt(
            Number(scoreDeptDevTotal[i][j] / deptSize[i][j])
          ).toFixed(4);
          scoreSubDeptStd[i][j] = Math.sqrt(
            Number(scoreSubDeptDevTotal[i][j] / deptSize[i][j])
          ).toFixed(4);
          scoreSumDeptStd[i][j] = Math.sqrt(
            Number(scoreSumDeptDevTotal[i][j] / deptSize[i][j])
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
          forkDeptStd[i][j] = Math.sqrt(
            Number(forkDeptDevTotal[i][j] / deptSize[i][j])
          ).toFixed(4);
        }
      }
      for (let i = 0; i < nowYear - startYear + 1; i++) {
        scoreYearStd[i] = Math.sqrt(
          Number(scoreYearDevTotal[i] / annualCnt[i])
        ).toFixed(4);
        scoreSubYearStd[i] = Math.sqrt(
          Number(scoreSubYearDevTotal[i] / annualCnt[i])
        ).toFixed(4);
        scoreSumYearStd[i] = Math.sqrt(
          Number(scoreSumYearDevTotal[i] / annualCnt[i])
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
        forkYearStd[i] = Math.sqrt(
          Number(forkYearDevTotal[i] / annualCnt[i])
        ).toFixed(4);
      }

      DB("GET", repoQuery, []).then(function (data, error) {
        if (error) {
          console.log(error);
        }
        try {
          totalRepo = data.row.length;
          for (i = 0; i < totalRepo; i++) {
            let idx =
              nowYear -
              parseInt(data.row[i].create_date.toISOString().substring(0, 4));
            repoDist[idx] += 1;
            if (idx > 2) continue;
            if (!studentRepo[idx].hasOwnProperty(data.row[i]["github_id"])) {
              studentRepo[idx][data.row[i]["github_id"]] = 1;
            } else {
              studentRepo[idx][data.row[i]["github_id"]]++;
            }
          }
        } catch (e) {
          console.log("repo count error: ", e);
        }
        try {
          res.json({
            title: "chart",
            scoreMore3: scoreMore3,
            scoreSubMore3: scoreSubMore3,
            scoreSumMore3: scoreSumMore3,
            totalCommit: totalCommit,
            totalStar: totalStar,
            totalRepo: totalRepo,
            repoDist: repoDist,
            annual: {
              score: scoreMean,
              score_sub: scoreSubMean,
              score_sum: scoreSumMean,
              commit: commitMean,
              star: starMean,
              pr: prMean,
              issue: issueMean,
              fork: forkMean,
              scoreStd: scoreYearStd,
              scoreSubStd: scoreSubYearStd,
              scoreSumStd: scoreSumYearStd,
              commitStd: commitYearStd,
              starStd: starYearStd,
              prStd: prYearStd,
              issueStd: issueYearStd,
              forkStd: forkYearStd,
            },
            year2019: {
              score_dist: scoreDist[0],
              score_dept: scoreDept[0],
              score_sid: scoreSid[0],
              score_sub_dist: scoreSubDist[0],
              score_sub_dept: scoreSubDept[0],
              score_sub_sid: scoreSubSid[0],
              score_sum_dist: scoreSumDist[0],
              score_sum_dept: scoreSumDept[0],
              score_sum_sid: scoreSumSid[0],
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
              fork_dist: forkDist[0],
              fork_dept: forkDept[0],
              fork_sid: forkSid[0],
              scoreDeptStd: scoreDeptStd[0],
              scoreSidStd: scoreSidStd[0],
              scoreSubDeptStd: scoreSubDeptStd[0],
              scoreSubSidStd: scoreSubSidStd[0],
              scoreSumDeptStd: scoreSumDeptStd[0],
              scoreSumSidStd: scoreSumSidStd[0],
              commitDeptStd: commitDeptStd[0],
              commitSidStd: commitSidStd[0],
              starDeptStd: starDeptStd[0],
              starSidStd: starSidStd[0],
              prDeptStd: prDeptStd[0],
              prSidStd: prSidStd[0],
              issueDeptStd: issueDeptStd[0],
              issueSidStd: issueSidStd[0],
              forkDeptStd: forkDeptStd[0],
              forkSidStd: forkSidStd[0],

              scoreSidTop5pct: scoreSidTop5pct[0],
              scoreSubSidTop5pct: scoreSubSidTop5pct[0],
              scoreSumSidTop5pct: scoreSumSidTop5pct[0],
              commitSidTop5pct: commitSidTop5pct[0],
              starSidTop5pct: starSidTop5pct[0],
              prSidTop5pct: prSidTop5pct[0],
              issueSidTop5pct: issueSidTop5pct[0],
              forkSidTop5pct: forkSidTop5pct[0],
              scoreDeptTop5pct: scoreDeptTop5pct[0],
              scoreSubDeptTop5pct: scoreSubDeptTop5pct[0],
              scoreSumDeptTop5pct: scoreSumDeptTop5pct[0],
              commitDeptTop5pct: commitDeptTop5pct[0],
              starDeptTop5pct: starDeptTop5pct[0],
              prDeptTop5pct: prDeptTop5pct[0],
              issueDeptTop5pct: issueDeptTop5pct[0],
              forkDeptTop5pct: forkDeptTop5pct[0],
            },
            year2020: {
              score_dist: scoreDist[1],
              score_dept: scoreDept[1],
              score_sid: scoreSid[1],
              score_sub_dist: scoreSubDist[1],
              score_sub_dept: scoreSubDept[1],
              score_sub_sid: scoreSubSid[1],
              score_sum_dist: scoreSumDist[1],
              score_sum_dept: scoreSumDept[1],
              score_sum_sid: scoreSumSid[1],
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
              fork_dist: forkDist[1],
              fork_dept: forkDept[1],
              fork_sid: forkSid[1],
              scoreDeptStd: scoreDeptStd[1],
              scoreSidStd: scoreSidStd[1],
              scoreSubDeptStd: scoreSubDeptStd[1],
              scoreSubSidStd: scoreSubSidStd[1],
              scoreSumDeptStd: scoreSumDeptStd[1],
              scoreSumSidStd: scoreSumSidStd[1],
              commitDeptStd: commitDeptStd[1],
              commitSidStd: commitSidStd[1],
              starDeptStd: starDeptStd[1],
              starSidStd: starSidStd[1],
              prDeptStd: prDeptStd[1],
              prSidStd: prSidStd[1],
              issueDeptStd: issueDeptStd[1],
              issueSidStd: issueSidStd[1],
              forkDeptStd: forkDeptStd[1],
              forkSidStd: forkSidStd[1],

              scoreSidTop5pct: scoreSidTop5pct[1],
              scoreSubSidTop5pct: scoreSubSidTop5pct[1],
              scoreSumSidTop5pct: scoreSumSidTop5pct[1],
              commitSidTop5pct: commitSidTop5pct[1],
              starSidTop5pct: starSidTop5pct[1],
              prSidTop5pct: prSidTop5pct[1],
              issueSidTop5pct: issueSidTop5pct[1],
              forkSidTop5pct: forkSidTop5pct[1],
              scoreDeptTop5pct: scoreDeptTop5pct[1],
              scoreSubDeptTop5pct: scoreSubDeptTop5pct[1],
              scoreSumDeptTop5pct: scoreSumDeptTop5pct[1],
              commitDeptTop5pct: commitDeptTop5pct[1],
              starDeptTop5pct: starDeptTop5pct[1],
              prDeptTop5pct: prDeptTop5pct[1],
              issueDeptTop5pct: issueDeptTop5pct[1],
              forkDeptTop5pct: forkDeptTop5pct[1],
            },
            year2021: {
              score_dist: scoreDist[2],
              score_dept: scoreDept[2],
              score_sid: scoreSid[2],
              score_sub_dist: scoreSubDist[2],
              score_sub_dept: scoreSubDept[2],
              score_sub_sid: scoreSubSid[2],
              score_sum_dist: scoreSumDist[2],
              score_sum_dept: scoreSumDept[2],
              score_sum_sid: scoreSumSid[2],
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
              fork_dist: forkDist[2],
              fork_dept: forkDept[2],
              fork_sid: forkSid[2],
              scoreDeptStd: scoreDeptStd[2],
              scoreSidStd: scoreSidStd[2],
              scoreSubDeptStd: scoreSubDeptStd[2],
              scoreSubSidStd: scoreSubSidStd[2],
              scoreSumDeptStd: scoreSumDeptStd[2],
              scoreSumSidStd: scoreSumSidStd[2],
              commitDeptStd: commitDeptStd[2],
              commitSidStd: commitSidStd[2],
              starDeptStd: starDeptStd[2],
              starSidStd: starSidStd[2],
              prDeptStd: prDeptStd[2],
              prSidStd: prSidStd[2],
              issueDeptStd: issueDeptStd[2],
              issueSidStd: issueSidStd[2],
              forkDeptStd: forkDeptStd[2],
              forkSidStd: forkSidStd[2],

              scoreSidTop5pct: scoreSidTop5pct[2],
              scoreSubSidTop5pct: scoreSubSidTop5pct[2],
              scoreSumSidTop5pct: scoreSumSidTop5pct[2],
              commitSidTop5pct: commitSidTop5pct[2],
              starSidTop5pct: starSidTop5pct[2],
              prSidTop5pct: prSidTop5pct[2],
              issueSidTop5pct: issueSidTop5pct[2],
              forkSidTop5pct: forkSidTop5pct[2],
              scoreDeptTop5pct: scoreDeptTop5pct[2],
              scoreSubDeptTop5pct: scoreSubDeptTop5pct[2],
              scoreSumDeptTop5pct: scoreSumDeptTop5pct[2],
              commitDeptTop5pct: commitDeptTop5pct[2],
              starDeptTop5pct: starDeptTop5pct[2],
              prDeptTop5pct: prDeptTop5pct[2],
              issueDeptTop5pct: issueDeptTop5pct[2],
              forkDeptTop5pct: forkDeptTop5pct[2],
            },
            size: annualCnt,
            student2019: studentData[0],
            student2020: studentData[1],
            student2021: studentData[2],
            student: studentData,
            repo2019: studentRepo[2],
            repo2020: studentRepo[1],
            repo2021: studentRepo[0],
            repo: studentRepo,
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
  function create2DArray_a(rows, columns) {
    const arr = new Array(rows);
    for (let i = 0; i < rows; i++) {
      arr[i] = new Array(columns);
      for (let j = 0; j < columns; j++) {
        arr[i][j] = [];
      }
    }
    return arr;
  }
});

module.exports = router;
