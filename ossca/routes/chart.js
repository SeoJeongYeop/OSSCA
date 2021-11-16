const express = require("express");
const router = express.Router();
const DB = require("./database");

router.get("/", (req, res, next) => {
  let query = `SELECT gs.github_id, gs.year, gs.excellent_contributor, 
round(gs.guideline_score+gs.code_score+gs.other_project_score,1) as owner_score, 
gs.contributor_score, round(gs.star_score+gs.contribution_score,1) as additional_score,  
gs.best_repo, gs.star_count, gs.commit_count, st.id, st.dept
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
    let distribution = create2DArray(3, 10);
    let dept = create2DArray(3, 3);
    let sid = create2DArray(3, 7);
    let totalCommit = 0;
    let totalStar = 0;
    let annual = [0, 0, 0];
    let annualCnt = [0, 0, 0];
    let size = [0, 0, 0];
    let sidSize = [0, 0, 0, 0, 0, 0, 0];
    let deptSize = [0, 0, 0];
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
        totalCommit += Row.commit_count;
        totalStar += Row.star_count;
        idx1 = Row.year - startYear;
        idxId = nowYear - Math.floor(Row.id / 1000000);

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
        sid[idx1][idxId] += Number(Row.total_score);
        sidSize[idxId] += 1;
        /* dept */
        commitDept[idx1][deptDict[Row.dept]] += Row.commit_count;
        starDept[idx1][deptDict[Row.dept]] += Row.star_count;
        dept[idx1][deptDict[Row.dept]] += Number(Row.total_score);
        deptSize[idxId] += 1;
        if (Row.total_score < 0.5) {
          distribution[idx1][0] += 1;
        } else if (Row.total_score < 1) {
          distribution[idx1][1] += 1;
        } else if (Row.total_score < 1.5) {
          distribution[idx1][2] += 1;
        } else if (Row.total_score < 2) {
          distribution[idx1][3] += 1;
        } else if (Row.total_score < 2.5) {
          distribution[idx1][4] += 1;
        } else if (Row.total_score < 3) {
          distribution[idx1][5] += 1;
        } else if (Row.total_score < 3.5) {
          distribution[idx1][6] += 1;
        } else if (Row.total_score < 4) {
          distribution[idx1][7] += 1;
        } else if (Row.total_score < 4.5) {
          distribution[idx1][8] += 1;
        } else if (Row.total_score >= 4.5) {
          distribution[idx1][9] += 1;
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
        // annual
        annual[idx1] += Number(Row.total_score);
        annualCnt[idx1] += 1;
      }
      // console.log("sid1 ", sid[0], sid[1]);
      // for (let i = 0; i < sid.length; i++) {
      //   commitSid.map((val) => (val / sidSize[i]).toFixed(1));
      //   starSid.map((val) => (val / sidSize[i]).toFixed(1));
      // }
      // console.log("sid2 ", sid[0], sid[1]);
      // console.log("dept1 ", dept[0], dept[1], dept[2]);
      // for (let i = 0; i < sid.length; i++) {
      //   commitDept[i].map((val) => (val / deptSize[i]).toFixed(1));
      //   starDept[i].map((val) => (val / deptSize[i]).toFixed(1));
      // }
      // console.log("dept2 ", dept[0], dept[1], dept[2]);
      // response
      DB("GET", repoQuery, []).then(function (date, error) {
        totalRepo = date.row.length;
        for (i = 0; i < totalRepo; i++) {
          let idx =
            nowYear -
            parseInt(date.row[i].create_date.toISOString().substring(0, 4));
          repoDist[idx] += 1;
          //console.log(idx, repoDist[idx]);
        }
        try {
          //res.json
          console.log(result.row.length);
          res.json({
            title: "chart",
            totalCommit: totalCommit,
            totalStar: totalStar,
            totalRepo: totalRepo,
            repoDist: repoDist,
            annual: annual,
            annualCnt: annualCnt,
            year2019: {
              distribution: distribution[0],
              dept: dept[0],
              sid: sid[0],
              commit_dist: commitDist[0],
              commit_dept: commitDept[0],
              commit_sid: commitSid[0],
              star_dist: starDist[0],
              star_dept: starDept[0],
              star_sid: starSid[0],
            },
            year2020: {
              distribution: distribution[1],
              dept: dept[1],
              sid: sid[1],
              commit_dist: commitDist[1],
              commit_dept: commitDept[1],
              commit_sid: commitSid[1],
              star_dist: starDist[1],
              star_dept: starDept[1],
              star_sid: starSid[1],
            },
            year2021: {
              distribution: distribution[2],
              dept: dept[2],
              sid: sid[2],
              commit_dist: commitDist[2],
              commit_dept: commitDept[2],
              commit_sid: commitSid[2],
              star_dist: starDist[2],
              star_dept: starDept[2],
              star_Sid: starSid[2],
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
