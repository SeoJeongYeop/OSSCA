window.onload = function () {
  let port = "8000";

  const promise = fetch(`http://localhost:${port}/chart`)
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
      let distribution = json.year2021["distribution"];
      let yearData = json.year2021["year"];
      let deptData = json.year2021["dept"];

      // Overall statistic data: 3점 이상 비율, 총 커밋 수, 총 스타 수, 총 레포 수
      const overGoal = document.getElementById("overGoal");
      const totalCommit = document.getElementById("totalCommit");
      const totalStar = document.getElementById("totalStar");
      const totalRepo = document.getElementById("totalRepo");

      totalCommit.textContent = String(json.totalCommit);
      totalStar.textContent = String(json.totalStar);
      totalRepo.textContent = String(json.totalRepo);

      overGoal.textContent =
        String(distribution[3] + distribution[4]) + "/" + json.size;
      // 바깥쪽에 두면 싱크가 안맞아서 그래프가 안나타난다.
      let totalScoreDist = document
        .getElementById("totalScoreDist")
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
      let pieChart1 = makeChart(
        totalScoreDist,
        "pie",
        ["0~1", "1~2", "2~3", "3~4", "4~5"],
        distribution,
        ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"],
        {}
      );

      let barChart1 = makeChart(
        yearScoreDist,
        "bar",
        ["1", "2", "3", "4", "5+"],
        yearData,
        ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"],
        {}
      );
      let barChart2 = makeChart(
        deptScoreDist,
        "bar",
        ["소프트웨어", "글로벌융합", "컴퓨터공학"],
        deptData,
        ["#4245cb", "#ff4470", "#ffe913"],
        {}
      );
      let lineChart = makeChart(
        annualScoreDist,
        "line",
        ["2019", "2020", "2021"],
        annual_mean,
        [],
        {}
      );
      const btn21 = document.getElementById("dropdownBtn2021");
      const btn20 = document.getElementById("dropdownBtn2020");
      const btn19 = document.getElementById("dropdownBtn2019");
      btn21.addEventListener("click", function () {
        document.getElementById("dropdownMenuButton1").textContent = "2021";
        distribution = json.year2021["distribution"];
        yearData = json.year2021["year"];
        deptData = json.year2021["dept"];
        try {
          pieChart1.destroy();
          pieChart1 = makeChart(
            totalScoreDist,
            "pie",
            ["0~1", "1~2", "2~3", "3~4", "4~5"],
            distribution,
            ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"],
            {}
          );
          barChart1.destroy();
          barChart1 = makeChart(
            yearScoreDist,
            "bar",
            ["1", "2", "3", "4", "5+"],
            yearData,
            ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"],
            {}
          );
          barChart2.destroy();
          barChart2 = makeChart(
            deptScoreDist,
            "bar",
            ["소프트웨어", "글로벌융합", "컴퓨터공학"],
            deptData,
            ["#4245cb", "#ff4470", "#ffe913"],
            {}
          );
        } catch (e) {
          console.log("error", e);
        }
      });
      btn20.addEventListener("click", function () {
        document.getElementById("dropdownMenuButton1").textContent = "2020";
        distribution = json.year2020["distribution"];
        yearData = json.year2020["year"];
        deptData = json.year2020["dept"];
        pieChart1.destroy();
        pieChart1 = makeChart(
          totalScoreDist,
          "pie",
          ["0~1", "1~2", "2~3", "3~4", "4~5"],
          distribution,
          ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"],
          {}
        );
        barChart1.destroy();
        barChart1 = makeChart(
          yearScoreDist,
          "bar",
          ["1", "2", "3", "4", "5+"],
          yearData,
          ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"],
          {}
        );
        barChart2.destroy();
        barChart2 = makeChart(
          deptScoreDist,
          "bar",
          ["소프트웨어", "글로벌융합", "컴퓨터공학"],
          deptData,
          ["#4245cb", "#ff4470", "#ffe913"],
          {}
        );
      });
      btn19.addEventListener("click", function () {
        document.getElementById("dropdownMenuButton1").textContent = "2019";
        distribution = json.year2019["distribution"];
        yearData = json.year2019["year"];
        deptData = json.year2019["dept"];
        pieChart1.destroy();
        pieChart1 = makeChart(
          totalScoreDist,
          "pie",
          ["0~1", "1~2", "2~3", "3~4", "4~5"],
          distribution,
          ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"],
          {}
        );
        barChart1.destroy();
        barChart1 = makeChart(
          yearScoreDist,
          "bar",
          ["1", "2", "3", "4", "5+"],
          yearData,
          ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"],
          {}
        );
        barChart2.destroy();
        barChart2 = makeChart(
          deptScoreDist,
          "bar",
          ["소프트웨어", "글로벌융합", "컴퓨터공학"],
          deptData,
          ["#4245cb", "#ff4470", "#ffe913"],
          {}
        );
      });
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
