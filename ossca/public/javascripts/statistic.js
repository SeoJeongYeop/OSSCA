window.onload = function () {
  //const IP = "localhost";
  const IP = "115.145.212.144";
  const port = "8081";
  /* 미구현
  - pr, issue 그래프
  - 검색기능
  */
  const promise = fetch(`http://${IP}:${port}/chart`)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((json) => {
      console.log("check", json.totalCommit, json.totalStar, json.totalRepo);
      const scoreAnnual = json["annual"]["score"];
      const commitAnnual = json["annual"]["commit"];
      const starAnnual = json["annual"]["star"];
      let annualList = [scoreAnnual, commitAnnual, starAnnual, [], []];
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

      // const score
      // const labelRule = []
      const canvasNameRule = ["total", "totalLine", "sid", "dept", "annual"];
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
      const allChartRule = ["pie", "line", "bar", "bar", "line", "line"];
      let chartColorRule = [cc10, cc10, cc6, cc3, cc3, cc5];
      for (let i = 0; i < 5; i++) {
        chart[i] = makeChart(
          ctx[i],
          allChartRule[i],
          chartFactor,
          labelList[i],
          datasetList[i],
          chartColorRule[i],
          {}
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
        scoreTab.setAttribute("class", "btn btn-primary chosen");
        chartFactor = "score";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      commitTab.addEventListener("click", function () {
        unchosenBtn();
        commitTab.setAttribute("class", "btn btn-primary chosen");
        chartFactor = "commit";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      starTab.addEventListener("click", function () {
        unchosenBtn();
        starTab.setAttribute("class", "btn btn-primary chosen");
        chartFactor = "star";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      prTab.addEventListener("click", function () {
        unchosenBtn();
        prTab.setAttribute("class", "btn btn-primary chosen");
        chartFactor = "pr";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      issueTab.addEventListener("click", function () {
        unchosenBtn();
        issueTab.setAttribute("class", "btn btn-primary chosen");
        chartFactor = "issue";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
        setDist(chartFactor);
      });
      function unchosenBtn() {
        scoreTab.setAttribute("class", "btn btn-light unchosen");
        commitTab.setAttribute("class", "btn btn-light unchosen");
        starTab.setAttribute("class", "btn btn-light unchosen");
        prTab.setAttribute("class", "btn btn-light unchosen");
        issueTab.setAttribute("class", "btn btn-light unchosen");
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

      function setOverallStat(json) {
        // Overall statistic data: 3점 이상 비율, 총 커밋 수, 총 스타 수, 총 레포 수
        const dist = json[`year${annual}`]["score_dist"];
        const overGoal = document.getElementById("overGoal");
        const overGoalcount = dist[6] + dist[7] + dist[8] + dist[9];
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
            break;
          case "commit":
            labelList[0] = commitDistLabel;
            labelList[1] = commitDistLabel;
            chartColorRule = [cc5, cc5, cc6, cc3, cc3, cc5];
            break;
          case "star":
            labelList[0] = starDistLabel;
            labelList[1] = starDistLabel;
            chartColorRule = [cc5, cc5, cc6, cc3, cc3, cc5];
            break;
          case "pr":
            break;
          case "issue":
            break;
          default:
            console.log("default!!");
        }
        dist = json[`year${annual}`][`${factor}_dist`];
        sidData = json[`year${annual}`][`${factor}_sid`];
        deptData = json[`year${annual}`][`${factor}_dept`];
        datasetList = [dist, dist, sidData, deptData, annualList[annualIdx]];
        console.log("labelList", labelList);
        console.log("datasetList", datasetList);
        for (let i = 0; i < 5; i++) {
          chart[i] = makeChart(
            ctx[i],
            allChartRule[i],
            chartFactor,
            labelList[i],
            datasetList[i],
            chartColorRule[i],
            {}
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
