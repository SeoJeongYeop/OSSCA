window.onload = function () {
  //const IP = "localhost";
  const IP = "115.145.212.144";
  const port = "8081";
  /* 미구현
  - 검색기능
  */
  const promise = fetch(`http://${IP}:${port}/chartdata`)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((json) => {
      console.log("check", json.totalCommit, json.totalStar, json.totalRepo);
      const scoreAnnual = json["annual"]["score"];
      const commitAnnual = json["annual"]["commit"];
      const starAnnual = json["annual"]["star"];
      const prAnnual = json["annual"]["pr"];
      const issueAnnual = json["annual"]["issue"];
      let annualList = [
        scoreAnnual,
        commitAnnual,
        starAnnual,
        prAnnual,
        issueAnnual,
      ];
      //default annual setting 2021
      let chartFactor = "score";
      let annual = 2021;
      let startAnnual = 2019;
      let dist = json[`year${annual}`]["score_dist"];
      let sidData = json.year2021["score_sid"];
      let deptData = json.year2021["score_dept"];

      // 바깥쪽에 두면 싱크가 안맞아서 그래프가 안나타난다.
      const scoreDistLabel = new Array(10);
      const scoreDistLineLabel = new Array(10);
      for (let i = 0; i < 10; i++) {
        scoreDistLabel[i] = `${((5 * i) / 10).toFixed(1)}~${(
          (5 * i) / 10 +
          0.5
        ).toFixed(1)}`;
        scoreDistLineLabel[i] = `${((5 * i) / 10).toFixed(1)}`;
      }
      const commitDistLabel = [
        "0~100",
        "100~200",
        "200~300",
        "300~400",
        "400+",
      ];
      const starDistLabel = ["0", "1~2", "3~4", "5~6", "7+"];
      const prDistLabel = ["0", "1~10", "11~20", "21~30", "30+"];
      const issueDistLabel = ["0", "1~5", "6~10", "11~15", "15+"];
      const sidLabel = ["21", "20", "19", "18", "17", "16"];
      const deptLabel = ["소프트웨어", "글로벌융합", "컴퓨터공학"];
      const annualLabel = ["2019", "2020", "2021"];
      let labelList = [
        scoreDistLabel,
        scoreDistLineLabel,
        sidLabel,
        deptLabel,
        annualLabel,
        annualLabel,
      ];
      let datasetList = [dist, dist, sidData, deptData, annualList[0]];
      let sidStd = json[`year2021`][`${chartFactor}SidStd`];
      let deptStd = json[`year2021`][`${chartFactor}DeptStd`];
      let annualStd = json[`annual`][`${chartFactor}Std`];
      console.log("sidtest", sidData, sidStd);
      console.log("depttest", deptData, deptStd);
      datasetList = [
        dist,
        dist,
        makeErrorJson(sidData, sidStd),
        makeErrorJson(deptData, deptStd),
        makeErrorJson(annualList[0], annualStd),
      ];
      const overviewNameRule = ["score", "commit", "star", "repo"];
      const canvasNameRule = ["total", "totalLine", "sid", "dept", "annual"];
      let ctxOverview = new Array(4);
      for (let i = 0; i < 4; i++) {
        ctxOverview[i] = document
          .getElementById(`${overviewNameRule[i]}Overview`)
          .getContext("2d");
      }
      let ctx = new Array(5);
      for (let i = 0; i < 5; i++) {
        ctx[i] = document
          .getElementById(`${canvasNameRule[i]}ScoreDist`)
          .getContext("2d");
      }

      setOverallStat(json);
      setDist(chartFactor);
      /* color pallet ref: 
      https://learnui.design/tools/data-color-picker.html#palette*/
      const bsPrimary = "#0d6efd";
      const cc3 = ["#4245cb", "#ff4470", "#ffe913"];
      const cc5 = ["#4245cb", "#db20ac", "#ff4470", "#ff9a2f", "#ffe913"];
      const cc6 = [
        "#4245cb",
        "#c629b6",
        "#ff268a",
        "#ff6657",
        "#ffab21",
        "#ffe913",
      ];
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

      const chart = createObjArray(6);
      const overviewChart = createObjArray(4);

      let overviewDatasetList = [
        json["scoreMore3"],
        json["totalCommit"],
        json["totalStar"],
        json["repoDist"],
      ];
      let overviewFactorList = ["count", "commit", "star", "repo"];
      for (let i = 0; i < 4; i++) {
        overviewChart[i] = makeChart(
          ctxOverview[i],
          "line",
          overviewFactorList[i],
          ["2019", "2020", "2021"],
          overviewDatasetList[i],
          bsPrimary,
          {
            plugins: {
              legend: {
                display: false,
              },
            },
          }
        );
      }
      const chartTypeRule = [
        "pie",
        "line",
        "barWithErrorBars",
        "barWithErrorBars",
        "lineWithErrorBars",
        "line",
      ];
      let chartColorRule = [cc10, cc10, cc6, cc3, cc3, cc5];
      // json["year2021"]["scoreDeptStd"];

      console.log("sample", labelList[3]);
      function makeErrorJson(dataArr, stdArr) {
        let newData = new Array(dataArr.length);

        console.log("dataArr", dataArr);
        for (let i = 0; i < dataArr.length; i++) {
          let errorJson = {};
          errorJson["y"] = Number(dataArr[i]);
          errorJson["yMax"] = Number(dataArr[i]) + Number(stdArr[i]);
          errorJson["yMin"] = Number(dataArr[i]) - Number(stdArr[i]);
          console.log("err", errorJson);
          newData[i] = errorJson;
        }
        console.log("newData");
        console.log("newData", newData);
        return newData;
      }
      let scoreOption = {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: { y: { max: 5 } },
      };
      let noLegendOption = {
        plugins: {
          legend: {
            display: false,
          },
        },
      };
      let chartOptions = [{}, {}, scoreOption, scoreOption, scoreOption];

      for (let i = 0; i < 5; i++) {
        chart[i] = makeChart(
          ctx[i],
          chartTypeRule[i],
          chartFactor,
          labelList[i],
          datasetList[i],
          chartColorRule[i],
          chartOptions[i]
        );
      }

      /* Add Event Listener to year button */
      const btn21 = document.getElementById("dropdownBtn2021");
      const btn20 = document.getElementById("dropdownBtn2020");
      const btn19 = document.getElementById("dropdownBtn2019");
      //pills-${factor}-tab
      const scoreTab = document.getElementById("pills-score-tab");
      const commitTab = document.getElementById("pills-commits-tab");
      const starTab = document.getElementById("pills-stars-tab");
      const prTab = document.getElementById("pills-pr-tab");
      const issueTab = document.getElementById("pills-issue-tab");
      btn21.addEventListener("click", function () {
        annual = 2021;
        setGraphData(annual, chartFactor);
        setOverallStat(json);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      btn20.addEventListener("click", function () {
        annual = 2020;
        setGraphData(annual, chartFactor);
        setOverallStat(json);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      btn19.addEventListener("click", function () {
        annual = 2019;
        setGraphData(annual, chartFactor);
        setOverallStat(json);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      scoreTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(scoreTab);
        chartFactor = "score";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      commitTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(commitTab);
        chartFactor = "commit";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      starTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(starTab);
        chartFactor = "star";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      prTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(prTab);
        chartFactor = "pr";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      issueTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(issueTab);
        chartFactor = "issue";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      function unchosenBtn() {
        scoreTab.classList.remove("active");
        commitTab.classList.remove("active");
        starTab.classList.remove("active");
        prTab.classList.remove("active");
        issueTab.classList.remove("active");
      }
      function chooseBtn(ele) {
        ele.classList.add("active");
      }
      function changeCardTitle(factor) {
        const cardTitle = document.getElementsByClassName("factor");
        let word;
        if (factor === "pr")
          word =
            factor.charAt(0).toUpperCase() + factor.charAt(1).toUpperCase();
        else {
          word = factor.charAt(0).toUpperCase() + factor.slice(1);
        }
        cardTitle.item(0).textContent = `전체 ${word}분포`;
        cardTitle.item(1).textContent = `${word} 퍼센티지`;
        cardTitle.item(2).textContent = `학번별 ${word}분포`;
        cardTitle.item(3).textContent = `학과별 ${word}분포`;
        cardTitle.item(4).textContent = `연도별 ${word}분포`;
      }

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      function setOverallStat(json) {
        // Overall statistic data: 3점 이상 비율, 총 커밋 수, 총 스타 수, 총 레포 수
        const overGoalcount = json["scoreMore3"][annual - startAnnual];
        $("#overGoalNumerator").text(numberWithCommas(overGoalcount));
        $("#overGoalDenominator").text(
          numberWithCommas(json.size[annual - startAnnual])
        );
        $("#overGoalPercent").text(
          ((overGoalcount / json.size[annual - startAnnual]) * 100).toFixed(1) +
            "%"
        );

        let sumTotalCommit = 0; // sum total commit
        let sumTotalStar = 0; // sum total star
        json.totalCommit.forEach((element) => {
          sumTotalCommit += element;
        });
        json.totalStar.forEach((element) => {
          sumTotalStar += element;
        });
        $("#commitNumerator").text(
          numberWithCommas(json.totalCommit[annual - startAnnual])
        );
        $("#commitDenominator").text(numberWithCommas(sumTotalCommit));
        $("#commitPercent").text(
          (
            (json.totalCommit[annual - startAnnual] / sumTotalCommit) *
            100
          ).toFixed(1) + "%"
        );
        $("#starNumerator").text(
          numberWithCommas(json.totalStar[annual - startAnnual])
        );
        $("#starDenominator").text(numberWithCommas(sumTotalStar));
        $("#starPercent").text(
          ((json.totalStar[annual - startAnnual] / sumTotalStar) * 100).toFixed(
            1
          ) + "%"
        );
        $("#repoNumerator").text(
          numberWithCommas(json.repoDist[-(annual - 2021)])
        );
        $("#repoDenominator").text(numberWithCommas([json.totalRepo]));
        $("#repoPercent").text(
          ((json.repoDist[-(annual - 2021)] / json.totalRepo) * 100).toFixed(
            1
          ) + "%"
        );
      }
      function setDist(factor) {
        const perScore = document.getElementById("perScore");
        const distTextClass = document.getElementsByClassName("dist-text");
        while (distTextClass.length !== 0) {
          perScore.removeChild(distTextClass.item(0));
        }
        for (let i = 0; i < dist.length; i++) {
          const pElement = document.createElement("p");
          const percent = (
            (dist[i] / json.size[annual - startAnnual]) *
            100
          ).toFixed(1);
          pElement.setAttribute("class", "card-text dist-text");
          // 퍼센테이지에 따라 글씨 색 바꾸기
          pElement.textContent = labelList[1][i] + ": " + percent + "%";
          pElement.style.color = `RGB(${(
            (parseInt(percent) * 255) /
            20
          ).toFixed(0)},${parseInt(percent).toFixed(0)},0)`;
          perScore.appendChild(pElement);
        }
      }
      function setGraphData(annual, factor) {
        document.getElementById("dropdownMenuButton1").textContent = annual;
        dist = json[`year${annual}`][`${factor}_dist`];
        sidData = json[`year${annual}`][`${factor}_sid`];
        deptData = json[`year${annual}`][`${factor}_dept`];
      }
      function makeChart(dist, type, factor, labels, data, color, options) {
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
          options: options,
        });
        return chart;
      }
      function destroyChart() {
        for (let i = 0; i < 5; i++) {
          chart[i].destroy();
        }
      }
      function reloadChart(annual, factor) {
        let annualIdx = indexFactor(factor);
        destroyChart();
        switch (factor) {
          case "score":
            labelList[0] = scoreDistLabel;
            labelList[1] = scoreDistLineLabel;
            chartColorRule = [cc10, cc10, cc6, cc3, cc3, cc5];
            chartOptions = [{}, {}, scoreOption, scoreOption, scoreOption];
            break;
          case "commit":
            labelList[0] = commitDistLabel;
            labelList[1] = commitDistLabel;
            chartColorRule = [cc5, cc5, cc6, cc3, cc3, cc5];
            chartOptions = [
              {},
              {},
              noLegendOption,
              noLegendOption,
              noLegendOption,
            ];
            break;
          case "star":
            labelList[0] = starDistLabel;
            labelList[1] = starDistLabel;
            chartColorRule = [cc5, cc5, cc6, cc3, cc3, cc5];
            chartOptions = [
              {},
              {},
              noLegendOption,
              noLegendOption,
              noLegendOption,
            ];
            break;
          case "pr":
            labelList[0] = prDistLabel;
            labelList[1] = prDistLabel;
            chartColorRule = [cc5, cc5, cc6, cc3, cc3, cc5];
            chartOptions = [
              {},
              {},
              noLegendOption,
              noLegendOption,
              noLegendOption,
            ];
            break;
          case "issue":
            labelList[0] = issueDistLabel;
            labelList[1] = issueDistLabel;
            chartColorRule = [cc5, cc5, cc6, cc3, cc3, cc5];
            chartOptions = [
              {},
              {},
              noLegendOption,
              noLegendOption,
              noLegendOption,
            ];
            break;
          default:
            console.log("default!!");
        }
        dist = json[`year${annual}`][`${factor}_dist`];
        sidData = json[`year${annual}`][`${factor}_sid`];
        deptData = json[`year${annual}`][`${factor}_dept`];
        datasetList = [dist, dist, sidData, deptData, annualList[annualIdx]];

        sidStd = json[`year${annual}`][`${factor}SidStd`];
        deptStd = json[`year${annual}`][`${factor}DeptStd`];
        annualStd = json[`annual`][`${factor}Std`];
        console.log("sidtest", sidData, sidStd);
        console.log("depttest", deptData, deptStd);
        datasetList = [
          dist,
          dist,
          makeErrorJson(sidData, sidStd),
          makeErrorJson(deptData, deptStd),
          makeErrorJson(annualList[annualIdx], annualStd),
        ];
        for (let i = 0; i < 5; i++) {
          chart[i] = makeChart(
            ctx[i],
            chartTypeRule[i],
            chartFactor,
            labelList[i],
            datasetList[i],
            chartColorRule[i],
            chartOptions[i]
          );
        }
      }
      function createObjArray(size) {
        const arr = new Array(size);
        for (let i = 0; i < size; i++) {
          arr[i] = new Object(null);
        }
        return arr;
      }
      function indexFactor(factor) {
        let idx = 0;
        switch (factor) {
          case "score":
            idx = 0;
            break;
          case "commit":
            idx = 1;
            break;
          case "star":
            idx = 2;
            break;
          case "pr":
            idx = 3;
            break;
          case "issue":
            idx = 4;
            break;
          default:
            console.log("default!!");
        }
        return idx;
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
