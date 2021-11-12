window.onload = function () {
  let port = "8000";
  let distribution = [];
  const promise = fetch(`http://localhost:${port}/chart`)
    .then((response) => {
      console.log(response);
      //console.log(response.json());
      return response.json();
    })
    .then((json) => {
      distribution = json.distribution;
      console.log(json.distribution);
      console.log(
        distribution[0],
        distribution[1],
        distribution[2],
        distribution[3],
        distribution[4]
      );
      // 바깥쪽에 두면 싱크가 안맞아서 그래프가 안나타난다.
      let myChartOne = document.getElementById("myChartOne").getContext("2d");
      let pieChart1 = new Chart(myChartOne, {
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
    });

  let myChartTwo = document.getElementById("myChartTwo").getContext("2d");
  let myChartThree = document.getElementById("myChartThree").getContext("2d");
  let myChartFour = document.getElementById("myChartFour").getContext("2d");
  // Fake Data

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
          borderWidth: 3,
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
          label: ["score"],
          data: [3.3, 3.3, 3.3, 3.3, 3.3],
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
          onclick: labelClick,
        },
        tooltips: {
          enabled: false,
        },
      },
    },
  });
  function labelClick() {
    console.log("click label!");
  }
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
