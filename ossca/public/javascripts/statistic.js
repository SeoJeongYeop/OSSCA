window.onload = function () {
  let port = "8000";
  let distribution = [];
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
      const overGoal = document.getElementById("overGoal");
      const totalCommit = document.getElementById("totalCommit");
      const totalStar = document.getElementById("totalStar");
      const totalRepo = document.getElementById("totalRepo");

      totalCommit.textContent = String(json.totalCommit);
      totalStar.textContent = String(json.totalStar);
      totalRepo.textContent = String(json.totalRepo);

      distribution = json.year2021["distribution"];
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
      let pieChart1 = new Chart(totalScoreDist, {
        type: "pie", //pie, line, doughnut, polarArea
        data: {
          labels: ["0~1", "1~2", "2~3", "3~4", "4~5"],
          datasets: [
            {
              label: "score",
              data: [
                distribution[0],
                distribution[1],
                distribution[2],
                distribution[3],
                distribution[4],
              ],
              backgroundColor: [
                "red",
                "blue",
                "#993300",
                "rgba(255,255,0,0.5)",
                "dodgerblue",
              ],
            },
          ],
        },
      });
      let barChart1 = new Chart(yearScoreDist, {
        type: "bar", //pie, line, doughnut, polarArea
        data: {
          labels: ["1", "2", "3", "4", "5+"],
          datasets: [
            {
              label: "score",
              data: json.year2020["year"],
              backgroundColor: [
                "red",
                "blue",
                "#993300",
                "rgba(255,255,0,0.5)",
                "dodgerblue",
              ],
              borderWidth: 3,
              borderColor: "#000",
              hoverBorderWidth: 8,
            },
          ],
        },
      });
      let barChart2 = new Chart(deptScoreDist, {
        type: "bar", //pie, line, doughnut, polarArea
        data: {
          //"데이터사이언스","인공지능","컬처앤테크놀로지"
          labels: ["소프트웨어", "글로벌융합", "컴퓨터공학"],
          datasets: [
            {
              label: ["score"],
              data: json.year2021["dept"],
              backgroundColor: [
                "red",
                "blue",
                "#993300",
                "rgba(255,255,0,0.5)",
                "dodgerblue",
              ],
            },
          ],
        },
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
      });
      let lineChart = new Chart(annualScoreDist, {
        type: "line", //pie, line, doughnut, polarArea
        data: {
          labels: ["2019", "2020", "2021"],
          datasets: [
            {
              label: "score",
              data: annual_mean,
              backgroundColor: [
                "red",
                "blue",
                "#993300",
                "rgba(255,255,0,0.5)",
                "dodgerblue",
              ],
              borderWidth: 5,
              borderColor: "#000",
              hoverBorderWidth: 8,
            },
          ],
        },
      });
    });
};
