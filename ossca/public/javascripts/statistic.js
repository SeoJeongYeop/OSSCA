window.onload = function () {
  //const Chart = require("chart.js");
  let myChartOne = document.getElementById("myChartOne").getContext("2d");
  let myChartTwo = document.getElementById("myChartTwo").getContext("2d");
  let myChartThree = document.getElementById("myChartThree").getContext("2d");
  let myChartFour = document.getElementById("myChartFour").getContext("2d");
  // Fake Data
  let pieChart1 = new Chart(myChartOne, {
    type: "pie", //pie, line, doughnut, polarArea
    data: {
      labels: ["1", "2", "3", "4", "5"],
      datasets: [
        {
          label: "score",
          data: [1000, 400, 200, 100, 0],
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
  let barChart1 = new Chart(myChartTwo, {
    type: "bar", //pie, line, doughnut, polarArea
    data: {
      labels: ["1", "2", "3", "4"],
      datasets: [
        {
          label: "score",
          data: [1.6, 2.9, 3.1, 3.4],
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
  let barChart2 = new Chart(myChartThree, {
    type: "bar", //pie, line, doughnut, polarArea
    data: {
      labels: [
        "소프트웨어",
        "컴퓨터공학",
        "데이터사이언스",
        "인공지능",
        "컬처앤테크놀로지",
      ],
      datasets: [
        {
          label: "score",
          data: [3.3, 3.3, 3.3, 3.3, 3.3],
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
    options: {
      title: {
        display: true,
        text: "바울랩 매출",
        fontSize: 30,
        fontColor: "red",
      },
      legend: {
        display: true,
        position: "right",
      },
      tooltips: {
        enabled: false,
      },
    },
  });

  let lineChart = new Chart(myChartFour, {
    type: "line", //pie, line, doughnut, polarArea
    data: {
      labels: ["2019", "2020", "2021"],
      datasets: [
        {
          label: "score",
          data: [1.4, 3.3, 3.6],
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
};
