window.onload = function () {
  //const IP = "localhost"
  const IP = "115.145.212.144";
  const port = "8081";

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
      let annual = 2021;
      let startAnnual = 2019;
      let distribution = json[`year${annual}`]["distribution"];
      let yearData = json.year2021["year"];
      let deptData = json.year2021["dept"];
      let commitDist = json.year2021["commit_dist"];
      let commitYearData = json.year2021["commit_year"];
      let commitDeptData = json.year2021["commit_dept"];
      let starDist = json.year2021["star_dist"];
      let starYearData = json.year2021["star_year"];
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
          console.log(((parseInt(percent) * 255) / 50).toFixed(0));
          pElement.style.color = `RGB(${(
            (parseInt(percent) * 255) /
            25
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
      let yearScoreDist = document
        .getElementById("yearScoreDist")
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
      let yearCommitDist = document
        .getElementById("yearCommitDist")
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
      let yearStarDist = document
        .getElementById("yearStarDist")
        .getContext("2d");
      let deptStarDist = document
        .getElementById("deptStarDist")
        .getContext("2d");
      let annualStarDist = document
        .getElementById("annualStarDist")
        .getContext("2d");
      const cc10 = [
        "#003f5c",
        "#2f4b7c",
        "#665191",
        "#a05195",
        "#d45087",
        "#f95d6a",
        "#ff7c43",
        "#ff9327",
        "#ffa600",
        "#ffe913",
      ];
      const cc5 = ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"];
      const cc3 = ["#4245cb", "#ff4470", "#ffe913"];
      //["0~1", "1~2", "2~3", "3~4", "4~5"]
      let totalScoreChart = makeChart(
        totalScoreDist,
        "pie",
        scoreDistLabel,
        distribution,
        cc10,
        {}
      );
      let totalScoreLineChart = makeChart(
        totalScoreLineDist,
        "line",
        ["0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5"],
        distribution,
        cc10,
        {}
      );

      let yearScoreChart = makeChart(
        yearScoreDist,
        "bar",
        ["1", "2", "3", "4", "5+"],
        yearData,
        cc5,
        {}
      );
      let deptScoreChart = makeChart(
        deptScoreDist,
        "bar",
        ["소프트웨어", "글로벌융합", "컴퓨터공학"],
        deptData,
        cc3,
        {}
      );
      let annualScoreChart = makeChart(
        annualScoreDist,
        "line",
        ["2019", "2020", "2021"],
        annual_mean,
        cc3,
        {}
      );

      let totalCommitChart = makeChart(
        totalCommitDist,
        "pie",
        ["0~100", "100~200", "200~300", "300~400", "400+"],
        commitDist,
        cc5,
        {}
      );

      let yearCommitChart = makeChart(
        yearCommitDist,
        "bar",
        ["1", "2", "3", "4", "5+"],
        commitYearData,
        cc5,
        {}
      );
      let deptCommitChart = makeChart(
        deptCommitDist,
        "bar",
        ["소프트웨어", "글로벌융합", "컴퓨터공학"],
        commitDeptData,
        cc3,
        {}
      );
      let annualCommitChart = makeChart(
        annualCommitDist,
        "line",
        ["2019", "2020", "2021"],
        annual_mean,
        [],
        {}
      );

      let totalStarChart = makeChart(
        totalStarDist,
        "pie",
        ["0", "1~2", "3~4", "5~6", "7+"],
        starDist,
        cc5,
        {}
      );

      let yearStarChart = makeChart(
        yearStarDist,
        "bar",
        ["1", "2", "3", "4", "5+"],
        starYearData,
        cc5,
        {}
      );
      let deptStarChart = makeChart(
        deptStarDist,
        "bar",
        ["소프트웨어", "글로벌융합", "컴퓨터공학"],
        starDeptData,
        cc3,
        {}
      );
      let annualStarChart = makeChart(
        annualStarDist,
        "line",
        ["2019", "2020", "2021"],
        annual_mean,
        [],
        {}
      );

      /* Add Event Listener to year button */
      const btn21 = document.getElementById("dropdownBtn2021");
      const btn20 = document.getElementById("dropdownBtn2020");
      const btn19 = document.getElementById("dropdownBtn2019");
      btn21.addEventListener("click", function () {
        annual = 2021;
        setGraphData(annual);
        setScoreDist();
        reloadChart();
      });
      btn20.addEventListener("click", function () {
        annual = 2020;
        setGraphData(annual);
        setScoreDist();
        reloadChart();
      });
      btn19.addEventListener("click", function () {
        annual = 2019;
        setGraphData(annual);
        setScoreDist();
        reloadChart();
      });
      function setGraphData(annual) {
        document.getElementById("dropdownMenuButton1").textContent = annual;
        distribution = json[`year${annual}`]["distribution"];
        yearData = json[`year${annual}`]["year"];
        deptData = json[`year${annual}`]["dept"];
        commitDist = json[`year${annual}`]["commit_dist"];
        commitYearData = json[`year${annual}`]["commit_year"];
        commitDeptData = json[`year${annual}`]["commit_dept"];
        starDist = json[`year${annual}`]["star_dist"];
        starYearData = json[`year${annual}`]["star_year"];
        starDeptData = json[`year${annual}`]["star_dept"];
      }
      function makeChart(dist, type, labels, data, color, option) {
        const chart = new Chart(dist, {
          type: type,
          data: {
            labels: labels,
            datasets: [
              {
                label: ["score"],
                data: data,
                backgroundColor: color,
              },
            ],
          },
          option: option,
        });
        return chart;
      }
      function reloadChart() {
        totalScoreChart.destroy();
        totalScoreChart = makeChart(
          totalScoreDist,
          "pie",
          scoreDistLabel,
          distribution,
          cc10,
          {}
        );
        totalScoreLineChart.destroy();
        totalScoreLineChart = makeChart(
          totalScoreLineDist,
          "line",
          ["0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5"],
          distribution,
          cc10,
          {}
        );
        yearScoreChart.destroy();
        yearScoreChart = makeChart(
          yearScoreDist,
          "bar",
          ["1", "2", "3", "4", "5+"],
          yearData,
          cc5,
          {}
        );
        deptScoreChart.destroy();
        deptScoreChart = makeChart(
          deptScoreDist,
          "bar",
          ["소프트웨어", "글로벌융합", "컴퓨터공학"],
          deptData,
          cc3,
          {}
        );
        totalCommitChart.destroy();
        totalCommitChart = makeChart(
          totalCommitDist,
          "pie",
          ["0~100", "100~200", "200~300", "300~400", "400+"],
          commitDist,
          cc5,
          {}
        );
        yearCommitChart.destroy();
        yearCommitChart = makeChart(
          yearCommitDist,
          "bar",
          ["1", "2", "3", "4", "5+"],
          commitYearData,
          cc5,
          {}
        );
        deptCommitChart.destroy();
        deptCommitChart = makeChart(
          deptCommitDist,
          "bar",
          ["소프트웨어", "글로벌융합", "컴퓨터공학"],
          commitDeptData,
          cc3,
          {}
        );
        totalStarChart.destroy();
        totalStarChart = makeChart(
          totalStarDist,
          "pie",
          ["0", "1~2", "3~4", "5~6", "7+"],
          starDist,
          cc5,
          {}
        );
        yearStarChart.destroy();
        yearStarChart = makeChart(
          yearStarDist,
          "bar",
          ["1", "2", "3", "4", "5+"],
          starYearData,
          cc5,
          {}
        );
        deptStarChart.destroy();
        deptStarChart = makeChart(
          deptStarDist,
          "bar",
          ["소프트웨어", "글로벌융합", "컴퓨터공학"],
          starDeptData,
          cc3,
          {}
        );
      }
    });
};
function setOverallStat(json) {
  // Overall statistic data: 3점 이상 비율, 총 커밋 수, 총 스타 수, 총 레포 수

  const totalCommit = document.getElementById("totalCommit");
  const totalStar = document.getElementById("totalStar");
  const totalRepo = document.getElementById("totalRepo");
  totalCommit.textContent = String(json.totalCommit);
  totalStar.textContent = String(json.totalStar);
  totalRepo.textContent = String(json.totalRepo);
}
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
