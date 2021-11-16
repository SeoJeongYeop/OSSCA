window.onload = function () {
  //const IP = "localhost";
  const IP = "115.145.212.144";
  const port = "8081";
  /* 미구현
  - 연도별 분포
  - 개수별 퍼센티지 텍스트
  - eval or new function 사용한 코드 리팩토링
  */
  const promise = fetch(`http://${IP}:${port}/chart`)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((json) => {
      console.log("check", json.totalCommit, json.totalStar, json.totalRepo);
      let annual_mean = json["annual"].map((value, idx) => {
        return (value / json.annualCnt[idx]).toFixed(1);
      });
      //default annual setting 2021
      let chartFactor = "score";
      let annual = 2021;
      let startAnnual = 2019;
      let distribution = json[`year${annual}`]["distribution"];
      let sidData = json.year2021["sid"];
      let deptData = json.year2021["dept"];
      let commitDist = json.year2021["commit_dist"];
      let commitSidData = json.year2021["commit_sid"];
      let commitDeptData = json.year2021["commit_dept"];
      let starDist = json.year2021["star_dist"];
      let starSidData = json.year2021["star_sid"];
      let starDeptData = json.year2021["star_dept"];
      const scoreDistLabel = [
        "0~0.5",
        "0.5~1.0",
        "1.0~1.5",
        "1.5~2.0",
        "2.0~2.5",
        "2.5~3.0",
        "3.0~3.5",
        "3.5~4.0",
        "4.0~4.5",
        "4.5~5.0",
      ];
      setOverallStat(json);

      setScoreDist();
      function setScoreDist() {
        const perScore = document.getElementById("perScore");
        const distTextClass = document.getElementsByClassName("dist-text");
        while (distTextClass.length !== 0) {
          perScore.removeChild(distTextClass.item(0));
        }
        for (let i = 0; i < distribution.length; i++) {
          const pElement = document.createElement("p");
          const percent = (
            (distribution[i] / json.size[annual - startAnnual]) *
            100
          ).toFixed(1);
          pElement.setAttribute("class", "card-text dist-text");
          pElement.textContent = scoreDistLabel[i] + ": " + percent + "%";
          pElement.style.color = `RGB(${(
            (parseInt(percent) * 255) /
            20
          ).toFixed(0)},${parseInt(percent).toFixed(0)},0)`;
          perScore.appendChild(pElement);
        }
      }

      // 바깥쪽에 두면 싱크가 안맞아서 그래프가 안나타난다.
      let totalScoreDist = document
        .getElementById("totalScoreDist")
        .getContext("2d");
      let totalScoreLineDist = document
        .getElementById("tatalScoreLineDist")
        .getContext("2d");
      let sidScoreDist = document
        .getElementById("sidScoreDist")
        .getContext("2d");
      let deptScoreDist = document
        .getElementById("deptScoreDist")
        .getContext("2d");
      let annualScoreDist = document
        .getElementById("annualScoreDist")
        .getContext("2d");
      let totalCommitDist = document
        .getElementById("totalCommitDist")
        .getContext("2d");
      let totalCommitLineDist = document
        .getElementById("totalCommitLineDist")
        .getContext("2d");
      let sidCommitDist = document
        .getElementById("sidCommitDist")
        .getContext("2d");
      let deptCommitDist = document
        .getElementById("deptCommitDist")
        .getContext("2d");
      let annualCommitDist = document
        .getElementById("annualCommitDist")
        .getContext("2d");
      let totalStarDist = document
        .getElementById("totalStarDist")
        .getContext("2d");
      let totalStarLineDist = document
        .getElementById("totalStarLineDist")
        .getContext("2d");
      let sidStarDist = document.getElementById("sidStarDist").getContext("2d");

      let deptStarDist = document
        .getElementById("deptStarDist")
        .getContext("2d");
      let annualStarDist = document
        .getElementById("annualStarDist")
        .getContext("2d");
      const cc10 = [
        "#4245cb",
        "#743fc6",
        "#b52eb5",
        "#e1219e",
        "#ff2e83",
        "#ff5c5e",
        "#ff8046",
        "#ff9439",
        "#ffbe1b",
        "#ffe913",
      ];
      const cc5 = ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"];
      const cc3 = ["#4245cb", "#ff4470", "#ffe913"];
      //["0~1", "1~2", "2~3", "3~4", "4~5"]
      // eval 이나 new function을 사용해 코드 수 줄이는 방법 사용 가능
      let totalScoreChart = makeChart(
        totalScoreDist,
        "pie",
        chartFactor,
        scoreDistLabel,
        distribution,
        cc10,
        {}
      );
      let totalScoreLineChart = makeChart(
        totalScoreLineDist,
        "line",
        chartFactor,
        ["0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5"],
        distribution,
        cc10,
        {}
      );

      let sidScoreChart = makeChart(
        sidScoreDist,
        "bar",
        chartFactor,
        ["21", "20", "19", "18", "17", "16"],
        sidData,
        cc5,
        {}
      );
      let deptScoreChart = makeChart(
        deptScoreDist,
        "bar",
        chartFactor,
        ["소프트웨어", "글로벌융합", "컴퓨터공학"],
        deptData,
        cc3,
        {}
      );
      let annualScoreChart = makeChart(
        annualScoreDist,
        "line",
        chartFactor,
        ["2019", "2020", "2021"],
        annual_mean,
        cc3,
        {}
      );

      let totalCommitChart = makeChart(
        totalCommitDist,
        "pie",
        chartFactor,
        ["0~100", "100~200", "200~300", "300~400", "400+"],
        commitDist,
        cc5,
        {}
      );

      let totalCommitLineChart = makeChart(
        totalCommitLineDist,
        "line",
        chartFactor,
        ["0~100", "100~200", "200~300", "300~400", "400+"],
        commitDist,
        cc5,
        {}
      );

      let sidCommitChart = makeChart(
        sidCommitDist,
        "bar",
        chartFactor,
        ["21", "20", "19", "18", "17", "16"],
        commitSidData,
        cc5,
        {}
      );
      let deptCommitChart = makeChart(
        deptCommitDist,
        "bar",
        chartFactor,
        ["소프트웨어", "글로벌융합", "컴퓨터공학"],
        commitDeptData,
        cc3,
        {}
      );
      let annualCommitChart = makeChart(
        annualCommitDist,
        "line",
        chartFactor,
        ["2019", "2020", "2021"],
        annual_mean,
        [],
        {}
      );

      let totalStarChart = makeChart(
        totalStarDist,
        "pie",
        chartFactor,
        ["0", "1~2", "3~4", "5~6", "7+"],
        starDist,
        cc5,
        {}
      );

      let totalStarLineChart = makeChart(
        totalStarLineDist,
        "line",
        chartFactor,
        ["0", "1~2", "3~4", "5~6", "7+"],
        starDist,
        cc5,
        {}
      );

      let sidStarChart = makeChart(
        sidStarDist,
        "bar",
        chartFactor,
        ["21", "20", "19", "18", "17", "16"],
        starSidData,
        cc5,
        {}
      );
      let deptStarChart = makeChart(
        deptStarDist,
        "bar",
        chartFactor,
        ["소프트웨어", "글로벌융합", "컴퓨터공학"],
        starDeptData,
        cc3,
        {}
      );
      let annualStarChart = makeChart(
        annualStarDist,
        "line",
        chartFactor,
        ["2019", "2020", "2021"],
        annual_mean,
        [],
        {}
      );

      /* Add Event Listener to year button */
      const btn21 = document.getElementById("dropdownBtn2021");
      const btn20 = document.getElementById("dropdownBtn2020");
      const btn19 = document.getElementById("dropdownBtn2019");
      const scoreTab = document.getElementById("pills-score-tab"); //#pills-score-tab
      const commitTab = document.getElementById("pills-commits-tab");
      const starTab = document.getElementById("pills-stars-tab");
      const prTab = document.getElementById("pills-pr-tab");
      const issueTab = document.getElementById("pills-issue-tab");
      btn21.addEventListener("click", function () {
        annual = 2021;
        setGraphData(annual);
        setScoreDist();
        setOverallStat(json);
        reloadChart();
      });
      btn20.addEventListener("click", function () {
        annual = 2020;
        setGraphData(annual);
        setScoreDist();
        setOverallStat(json);
        reloadChart();
      });
      btn19.addEventListener("click", function () {
        annual = 2019;
        setGraphData(annual);
        setScoreDist();
        setOverallStat(json);
        reloadChart();
      });
      scoreTab.addEventListener("click", function () {
        chartFactor = "score";
        reloadChart();
      });
      commitTab.addEventListener("click", function () {
        console.log(chartFactor);
        chartFactor = "commit";
        console.log(chartFactor);
        reloadChart();
      });
      starTab.addEventListener("click", function () {
        chartFactor = "star";
        reloadChart();
      });
      prTab.addEventListener("click", function () {
        chartFactor = "pr";
        reloadChart();
      });
      issueTab.addEventListener("click", function () {
        chartFactor = "issue";
        reloadChart();
      });

      function setOverallStat(json) {
        // Overall statistic data: 3점 이상 비율, 총 커밋 수, 총 스타 수, 총 레포 수
        const distribution = json[`year${annual}`]["distribution"];
        const overGoal = document.getElementById("overGoal");
        const overGoalcount =
          distribution[6] + distribution[7] + distribution[8] + distribution[9];
        overGoal.textContent =
          String(overGoalcount) +
          "/" +
          json.size[annual - startAnnual] +
          " " +
          ((overGoalcount / json.size[annual - startAnnual]) * 100).toFixed(1) +
          "%";
        const totalCommit = document.getElementById("totalCommit");
        const totalStar = document.getElementById("totalStar");
        const totalRepo = document.getElementById("totalRepo");
        let TC = 0; // sum total commit
        let TS = 0; // sum total star
        json.totalCommit.forEach((element) => {
          TC += element;
        });
        json.totalStar.forEach((element) => {
          TS += element;
        });
        totalCommit.textContent = String(
          json.totalCommit[annual - startAnnual] + " / " + TC
        );
        totalStar.textContent = String(
          json.totalStar[annual - startAnnual] + " / " + TS
        );
        totalRepo.textContent = String(
          json.repoDist[-(annual - 2021)] + " / " + json.totalRepo
        );
      }

      function setGraphData(annual) {
        document.getElementById("dropdownMenuButton1").textContent = annual;
        distribution = json[`year${annual}`]["distribution"];
        sidData = json[`year${annual}`]["sid"];
        deptData = json[`year${annual}`]["dept"];
        commitDist = json[`year${annual}`]["commit_dist"];
        commitSidData = json[`year${annual}`]["commit_sid"];
        commitDeptData = json[`year${annual}`]["commit_dept"];
        starDist = json[`year${annual}`]["star_dist"];
        starSidData = json[`year${annual}`]["star_sid"];
        starDeptData = json[`year${annual}`]["star_dept"];
      }
      function makeChart(dist, type, factor, labels, data, color, option) {
        const chart = new Chart(dist, {
          type: type,
          data: {
            labels: labels,
            datasets: [
              {
                label: factor,
                data: data,
                backgroundColor: color,
              },
            ],
          },
          option: option,
        });
        return chart;
      }
      function destroyChart() {
        totalScoreChart.destroy();
        totalScoreLineChart.destroy();
        sidScoreChart.destroy();
        deptScoreChart.destroy();

        totalCommitChart.destroy();
        totalCommitLineChart.destroy();
        sidCommitChart.destroy();
        deptCommitChart.destroy();

        totalStarChart.destroy();
        totalStarLineChart.destroy();
        sidStarChart.destroy();
        deptStarChart.destroy();
      }
      function reloadChart() {
        destroyChart();
        totalScoreChart = makeChart(
          totalScoreDist,
          "pie",
          chartFactor,
          scoreDistLabel,
          distribution,
          cc10,
          {}
        );

        totalScoreLineChart = makeChart(
          totalScoreLineDist,
          "line",
          chartFactor,
          ["0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5"],
          distribution,
          cc10,
          {}
        );

        sidScoreChart = makeChart(
          sidScoreDist,
          "bar",
          chartFactor,
          ["21", "20", "19", "18", "17", "16"],
          sidData,
          cc5,
          {}
        );

        deptScoreChart = makeChart(
          deptScoreDist,
          "bar",
          chartFactor,
          ["소프트웨어", "글로벌융합", "컴퓨터공학"],
          deptData,
          cc3,
          {}
        );

        totalCommitChart = makeChart(
          totalCommitDist,
          "pie",
          chartFactor,
          ["0~100", "100~200", "200~300", "300~400", "400+"],
          commitDist,
          cc5,
          {}
        );

        totalCommitLineChart = makeChart(
          totalCommitLineDist,
          "line",
          chartFactor,
          ["0~100", "100~200", "200~300", "300~400", "400+"],
          commitDist,
          cc5,
          {}
        );

        sidCommitChart = makeChart(
          sidCommitDist,
          "bar",
          chartFactor,
          ["21", "20", "19", "18", "17", "16"],
          commitSidData,
          cc5,
          {}
        );

        deptCommitChart = makeChart(
          deptCommitDist,
          "bar",
          chartFactor,
          ["소프트웨어", "글로벌융합", "컴퓨터공학"],
          commitDeptData,
          cc3,
          {}
        );

        totalStarChart = makeChart(
          totalStarDist,
          "pie",
          chartFactor,
          ["0", "1~2", "3~4", "5~6", "7+"],
          starDist,
          cc5,
          {}
        );

        totalStarLineChart = makeChart(
          totalStarLineDist,
          "line",
          chartFactor,
          ["0", "1~2", "3~4", "5~6", "7+"],
          starDist,
          cc5,
          {}
        );

        sidStarChart = makeChart(
          sidStarDist,
          "bar",
          chartFactor,
          ["21", "20", "19", "18", "17", "16"],
          starSidData,
          cc5,
          {}
        );

        deptStarChart = makeChart(
          deptStarDist,
          "bar",
          chartFactor,
          ["소프트웨어", "글로벌융합", "컴퓨터공학"],
          starDeptData,
          cc3,
          {}
        );
      }
    });
};

/*
chart option example
*****
options: {
  plugins: {
    title: {
      text: "hello",
      display: true,
    },
    legend: {
      display: true,
      position: "bottom",
    },
    tooltips: {
      enabled: false,
    },
  },
},
*/
