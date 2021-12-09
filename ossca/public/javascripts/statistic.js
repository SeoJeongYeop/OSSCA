window.onload = function () {
  const promise = fetch(`/chartdata`)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((json) => {
      const scoreList = ["", "_sub", "_sum"];
      const scoreCapitalList = ["", "Sub", "Sum"];
      let scoreIdx = 0;
      console.log("check", json.totalCommit, json.totalStar, json.totalRepo);
      let scoreAnnual = json["annual"]["score"];
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
      let switchChecked = true;
      let chartFactor = "score";
      let annual = 2021;
      let startAnnual = 2019;
      let dist = json.year2021["score_dist"];
      let sidData = json.year2021["score_sid"];
      let deptData = json.year2021["score_dept"];
      let sidTopData = json.year2021["scoreSidTop5pct"];
      let deptTopData = json.year2021["scoreDeptTop5pct"];

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
        "400~500",
      ];
      const starDistLabel = ["0~2", "2~4", "4~6", "6~8", "8~10"]; //contain over 10
      const prDistLabel = ["0~5", "5~10", "10~15", "15~20", "20~25"];
      const issueDistLabel = ["0~2", "2~4", "4~6", "6~8", "8~10"];
      const sidLabel = ["21", "20", "19", "18", "17", "16"];
      const deptLabel = ["소프트웨어", "글로벌융합", "컴퓨터공학"];
      let labelList = [scoreDistLabel, sidLabel, deptLabel];
      console.log("DIST", dist);
      console.log("DIST", scoreDistLabel);
      console.log("NEW DIST", makeHistogramJson(dist, scoreDistLabel));
      let sidStd = json[`year2021`][`${chartFactor}SidStd`];
      let deptStd = json[`year2021`][`${chartFactor}DeptStd`];
      let annualStd = json[`annual`];
      const annualStdList = [
        annualStd["scoreStd"],
        annualStd["commitStd"],
        annualStd["starStd"],
        annualStd["prStd"],
        annualStd["issueStd"],
      ];
      console.log("sidtest", sidData, sidStd);
      console.log("depttest", deptData, deptStd);
      let datasetList = [
        makeHistogramJson(dist, scoreDistLabel), // original: dist
        makeErrorJson(sidData, sidStd),
        makeErrorJson(deptData, deptStd),
      ];
      const yearNameRule = ["score", "commit", "star", "pr", "issue"];
      const overviewNameRule = ["score", "commit", "star", "repo"];
      const canvasNameRule = ["total", "sid", "dept"];
      let ctxYear = new Array(5);
      for (let i = 0; i < 5; i++) {
        ctxYear[i] = document
          .getElementById(`${yearNameRule[i]}Year`)
          .getContext("2d");
      }
      let ctxOverview = new Array(4);
      for (let i = 0; i < 4; i++) {
        ctxOverview[i] = document
          .getElementById(`${overviewNameRule[i]}Overview`)
          .getContext("2d");
      }
      let ctx = new Array(3);
      for (let i = 0; i < 3; i++) {
        ctx[i] = document
          .getElementById(`${canvasNameRule[i]}ScoreDist`)
          .getContext("2d");
      }

      setOverallStat(json);
      /* color pallet ref: 
      https://learnui.design/tools/data-color-picker.html#palette*/
      const bsPrimary = "#0d6efd";
      const cc3 = ["#4245cb", "#ff4470", "#ffe913"];
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
      const noLegendOption = {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: { beginAtZero: true },
        },
      };
      const scoreOption = {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: { max: 5, beginAtZero: true },
        },
      };
      function histogramOption(offset) {
        return {
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                title: (items) => {
                  if (!items.length) {
                    return "";
                  }
                  const item = items[0];
                  const x = item.parsed.x;
                  let min = x - offset <= 0 ? 0 : x - offset;
                  let max = x + offset;
                  if (x === 0) {
                    min = 0;
                    max = 0;
                  }

                  return `${min}-${max}`;
                },
              },
            },
          },
          scales: {
            x: {
              type: "linear",
              offset: false,
              grid: {
                offset: false,
              },
              ticks: {
                stepSize: offset * 2,
              },
            },
            y: { beginAtZero: true },
          },
        };
      }

      const overviewChart = createObjArray(4);
      const chart = createObjArray(3);

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
          noLegendOption
        );
      }
      const chartTypeRule = ["bar", "barWithErrorBars", "barWithErrorBars"];
      let chartColorRule = [bsPrimary, cc6, cc3];
      let chartOptions = [histogramOption(0.25), scoreOption, scoreOption];
      let topdataRule = [
        [],
        makeScatterData(sidTopData, sidLabel),
        makeScatterData(deptTopData, deptLabel),
      ];
      for (let i = 0; i < 3; i++) {
        chart[i] = makeChart(
          ctx[i],
          chartTypeRule[i],
          chartFactor,
          labelList[i],
          datasetList[i],
          chartColorRule[i],
          chartOptions[i],
          topdataRule[i]
        );
      }

      /* Add Event Listener to year button */
      const btnScore = document.getElementsByClassName("btn-score");
      const btn21 = document.getElementById("dropdownBtn2021");
      const btn20 = document.getElementById("dropdownBtn2020");
      const btn19 = document.getElementById("dropdownBtn2019");
      //pills-${factor}-tab
      const scoreTab = document.getElementById("pills-score-tab");
      const commitTab = document.getElementById("pills-commits-tab");
      const starTab = document.getElementById("pills-stars-tab");
      const prTab = document.getElementById("pills-pr-tab");
      const issueTab = document.getElementById("pills-issue-tab");

      const switchTotal = document.getElementById("totalSwitch");
      for (let i = 0; i < btnScore.length; i++) {
        btnScore.item(i).addEventListener("click", (btn) => {
          for (let j = 0; j < btnScore.length; j++) {
            btnScore.item(j).classList.add("btn-outline-primary");
            btnScore.item(j).classList.remove("btn-primary");
          }
          btnScore.item(i).classList.remove("btn-outline-primary");
          btnScore.item(i).classList.add("btn-primary");
          scoreIdx = i;
          console.log("scoreIdx", i);
          //reload score year chart
          yearChart[0].destroy();
          yearChart[0] = makeChart(
            ctxYear[0],
            "lineWithErrorBars",
            yearFactorList[0],
            [2019, 2020, 2021],
            makeErrorJson(
              json["annual"][`score${scoreList[scoreIdx]}`],
              annualStd[`score${scoreCapitalList[scoreIdx]}Std`]
            ),
            bsPrimary,
            {
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: { max: 5, beginAtZero: true },
              },
            }
          );

          setGraphData(annual, chartFactor);
          setOverallStat(
            json,
            switchChecked ? 1 : json["size"][annual - startAnnual]
          );
          if (switchChecked === true) {
            //reload score overview chart
            overviewChart[0].destroy();
            overviewChart[0] = makeChart(
              ctxOverview[0],
              "line",
              overviewFactorList[0],
              ["2019", "2020", "2021"],
              json[`score${scoreCapitalList[scoreIdx]}More3`],
              bsPrimary,
              noLegendOption
            );
          } else {
            //reload score overview chart
            overviewChart[0].destroy();
            const data = [];
            for (let year = 2019; year <= 2021; year++) {
              json[`student${year}`].map((obj) => {
                const picked = (({
                  github_id,
                  score,
                  score_sub,
                  score_sum,
                }) => ({
                  github_id,
                  score,
                  score_sub,
                  score_sum,
                }))(obj);

                if (Number(picked[`score${scoreList[scoreIdx]}`]) >= 3) {
                  data.push({
                    x: String(year),
                    y: picked[`score${scoreList[scoreIdx]}`],
                    tooltip: picked["github_id"],
                  });
                }
              });
            }
            overviewChart[0] = makeChart(
              ctxOverview[0],
              "line",
              "score",
              ["2019", "2020", "2021"],
              data,
              bsPrimary,
              {
                borderColor: "rgba(255, 255, 255, 0)",
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      title: (items) => {
                        return items[0].raw.y;
                      },
                      label: (item) => {
                        return item.raw.tooltip;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      stepSize: 1,
                    },
                  },
                  y: {
                    max: 5,
                    beginAtZero: true,
                  },
                },
              }
            );
          }

          if (chartFactor === "score") {
            reloadChart(annual, chartFactor);
          }
        });
      }
      btn21.addEventListener("click", function () {
        $("#totalSwitch").classList;
        annual = 2021;
        setGraphData(annual, chartFactor);
        setOverallStat(
          json,
          switchChecked ? 1 : json["size"][annual - startAnnual]
        );
        reloadChart(annual, chartFactor);
      });
      btn20.addEventListener("click", function () {
        annual = 2020;
        setGraphData(annual, chartFactor);
        setOverallStat(
          json,
          switchChecked ? 1 : json["size"][annual - startAnnual]
        );
        reloadChart(annual, chartFactor);
      });
      btn19.addEventListener("click", function () {
        annual = 2019;
        setGraphData(annual, chartFactor);
        setOverallStat(
          json,
          switchChecked ? 1 : json["size"][annual - startAnnual]
        );
        reloadChart(annual, chartFactor);
      });
      scoreTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(scoreTab);
        chartFactor = "score";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
      });
      commitTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(commitTab);
        chartFactor = "commit";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
      });
      starTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(starTab);
        chartFactor = "star";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
      });
      prTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(prTab);
        chartFactor = "pr";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
      });
      issueTab.addEventListener("click", function () {
        unchosenBtn();
        chooseBtn(issueTab);
        chartFactor = "issue";
        changeCardTitle(chartFactor);
        reloadChart(annual, chartFactor);
      });
      switchTotal.addEventListener("change", function (e) {
        console.log(e.target.checked);
        $(".switch-toggle").toggleClass("bold");
        if (e.target.checked === false) {
          switchChecked = false;
          $("#commitTitle").text("학생당 Commit 수");
          $("#starTitle").text("학생당 Star 수");
          $("#repoTitle").text("학생당 Repo 수");
          setOverallStat(json, json["size"][annual - startAnnual]);
          destroyOverviewChart();
          const data = [];
          for (let year = 2019; year <= 2021; year++) {
            json[`student${year}`].map((obj) => {
              const picked = (({ github_id, score, score_sub, score_sum }) => ({
                github_id,
                score,
                score_sub,
                score_sum,
              }))(obj);
              if (Number(picked[`score${scoreList[scoreIdx]}`]) >= 3) {
                data.push({
                  x: String(year),
                  y: picked[`score${scoreList[scoreIdx]}`],
                  tooltip: picked["github_id"],
                  order: 1,
                });
              }
            });
          }
          overviewChart[0] = makeChart(
            ctxOverview[0],
            "line",
            "score",
            ["2019", "2020", "2021"],
            data,
            bsPrimary,
            {
              borderColor: "rgba(255, 255, 255, 0)",
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: (items) => {
                      return items[0].raw.y;
                    },
                    label: (item) => {
                      return item.raw.tooltip;
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    stepSize: 1,
                  },
                },
                y: {
                  max: 5,
                  beginAtZero: true,
                },
              },
            }
          );

          const commitDataset = [];
          for (let year = 2019; year <= 2021; year++) {
            json[`student${year}`].map((obj) => {
              const picked = (({ github_id, commit }) => ({
                github_id,
                commit,
              }))(obj);
              if (Number(picked["commit"]) > 0) {
                commitDataset.push({
                  x: String(year),
                  y: picked["commit"],
                  tooltip: picked["github_id"],
                });
              }
            });
          }
          overviewChart[1] = makeChart(
            ctxOverview[1],
            "line",
            "commit",
            ["2019", "2020", "2021"],
            commitDataset,
            bsPrimary,
            {
              borderColor: "rgba(255, 255, 255, 0)",
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: (items) => {
                      return items[0].raw.y;
                    },
                    label: (item) => {
                      return item.raw.tooltip;
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    stepSize: 1,
                  },
                },
                y: {
                  beginAtZero: true,
                },
              },
            }
          );

          const starDataset = [];
          for (let year = 2019; year <= 2021; year++) {
            json[`student${year}`].map((obj) => {
              const picked = (({ github_id, star }) => ({
                github_id,
                star,
              }))(obj);
              if (Number(picked["star"]) > 0) {
                starDataset.push({
                  x: String(year),
                  y: picked["star"],
                  tooltip: picked["github_id"],
                });
              }
            });
          }
          overviewChart[2] = makeChart(
            ctxOverview[2],
            "line",
            "star",
            ["2019", "2020", "2021"],
            starDataset,
            bsPrimary,
            {
              borderColor: "rgba(255, 255, 255, 0)",
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: (items) => {
                      return items[0].raw.y;
                    },
                    label: (item) => {
                      return item.raw.tooltip;
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    stepSize: 1,
                  },
                },
                y: {
                  beginAtZero: true,
                },
              },
            }
          );

          const repoDataset = [];
          for (let year = 2019; year <= 2021; year++) {
            for (let key in json[`repo${year}`]) {
              repoDataset.push({
                x: String(year),
                y: json[`repo${year}`][key],
                tooltip: key,
              });
            }
          }
          overviewChart[3] = makeChart(
            ctxOverview[3],
            "line",
            "repo",
            ["2019", "2020", "2021"],
            repoDataset,
            bsPrimary,
            {
              borderColor: "rgba(255, 255, 255, 0)",
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: (items) => {
                      return items[0].raw.y;
                    },
                    label: (item) => {
                      return item.raw.tooltip;
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    stepSize: 1,
                  },
                },
                y: {
                  beginAtZero: true,
                },
              },
            }
          );
        }
        if (e.target.checked === true) {
          switchChecked = true;
          $("#commitTitle").text("총 Commit 수");
          $("#starTitle").text("총 Star 수");
          $("#repoTitle").text("총 Repo 수");
          destroyOverviewChart();
          setOverallStat(json);
          overviewDatasetList = [
            json["scoreMore3"],
            json["totalCommit"],
            json["totalStar"],
            json["repoDist"],
          ];
          for (let i = 0; i < 4; i++) {
            overviewChart[i] = makeChart(
              ctxOverview[i],
              "line",
              overviewFactorList[i],
              ["2019", "2020", "2021"],
              overviewDatasetList[i],
              bsPrimary,
              noLegendOption
            );
          }
        }
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
        cardTitle.item(1).textContent = `학번별 ${word}분포`;
        cardTitle.item(2).textContent = `학과별 ${word}분포`;
      }

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      function setOverallStat(json, nStudent = 1) {
        // Overall statistic data: 3점 이상 비율, 총 커밋 수, 총 스타 수, 총 레포 수
        let fix = nStudent === 1 ? 0 : 1;
        const overGoalcount =
          json[`score${scoreCapitalList[scoreIdx]}More3`][annual - startAnnual];
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
          numberWithCommas(
            (json.totalCommit[annual - startAnnual] / nStudent).toFixed(fix)
          )
        );
        $("#commitDenominator").text(numberWithCommas(sumTotalCommit));
        $("#commitPercent").text(
          (
            (json.totalCommit[annual - startAnnual] /
              nStudent /
              sumTotalCommit) *
            100
          ).toFixed(1) + "%"
        );
        $("#starNumerator").text(
          numberWithCommas(
            (json.totalStar[annual - startAnnual] / nStudent).toFixed(fix)
          )
        );
        $("#starDenominator").text(numberWithCommas(sumTotalStar));
        $("#starPercent").text(
          (
            (json.totalStar[annual - startAnnual] / nStudent / sumTotalStar) *
            100
          ).toFixed(1) + "%"
        );
        $("#repoNumerator").text(
          numberWithCommas(
            (json.repoDist[-(annual - 2021)] / nStudent).toFixed(fix)
          )
        );
        $("#repoDenominator").text(numberWithCommas(json.totalRepo));
        $("#repoPercent").text(
          (
            (json.repoDist[-(annual - 2021)] / nStudent / json.totalRepo) *
            100
          ).toFixed(1) + "%"
        );

        controlFontSize();
      }
      function setGraphData(annual, factor) {
        document.getElementById("dropdownMenuButton1").textContent = annual;
        if (factor === "score") {
          dist = json[`year${annual}`][`${factor}${scoreList[scoreIdx]}_dist`];
          sidData =
            json[`year${annual}`][`${factor}${scoreList[scoreIdx]}_sid`];
          deptData =
            json[`year${annual}`][`${factor}${scoreList[scoreIdx]}_dept`];
          sidTopData =
            json[`year${annual}`][
              `${factor}${scoreCapitalList[scoreIdx]}SidTop5pct`
            ];
          deptTopData =
            json[`year${annual}`][
              `${factor}${scoreCapitalList[scoreIdx]}DeptTop5pct`
            ];
        } else {
          dist = json[`year${annual}`][`${factor}_dist`];
          sidData = json[`year${annual}`][`${factor}_sid`];
          deptData = json[`year${annual}`][`${factor}_dept`];
          sidTopData = json[`year${annual}`][`${factor}SidTop5pct`];
          deptTopData = json[`year${annual}`][`${factor}DeptTop5pct`];
        }
      }
      function makeChart(
        dist,
        type,
        factor,
        labels,
        data,
        color,
        options,
        topdata = []
      ) {
        let chart;

        if (color === bsPrimary) console.log("makechart", data);
        else console.log(labels.length, data.length);
        if (type === "barWithErrorBars") {
          const borderWidth = 0.9;
          const barPercentage = 0.9;
          const categoryPercentage = 1;

          chart = new Chart(dist, {
            data: {
              labels: labels,
              datasets: [
                {
                  type: type,
                  label: "num",
                  data: data,
                  backgroundColor: color,
                  borderWidth: borderWidth,
                  barPercentage: barPercentage,
                  categoryPercentage: categoryPercentage,
                },
                {
                  type: "scatter",
                  data: topdata,
                },
              ],
            },
            options: options,
          });
        } else if (type === "bar") {
          //Histogram
          const borderWidth = 1;
          const barPercentage = 1;
          const categoryPercentage = 1;

          chart = new Chart(dist, {
            data: {
              labels: labels,
              datasets: [
                {
                  type: type,
                  label: "num",
                  data: data,
                  backgroundColor: color,
                  borderWidth: borderWidth,
                  barPercentage: barPercentage,
                  categoryPercentage: categoryPercentage,
                },
              ],
            },
            options: options,
          });
        } else {
          chart = new Chart(dist, {
            data: {
              labels: labels,
              datasets: [
                {
                  type: type,
                  label: factor,
                  data: data,
                  backgroundColor: color,
                },
              ],
            },
            options: options,
          });
        }

        return chart;
      }
      function destroyChart() {
        for (let i = 0; i < 3; i++) {
          chart[i].destroy();
        }
      }
      function destroyOverviewChart() {
        for (let i = 0; i < 4; i++) {
          overviewChart[i].destroy();
        }
      }
      function reloadChart(annual, factor) {
        destroyChart();
        chartColorRule = [bsPrimary, cc6, cc3];
        switch (factor) {
          case "score":
            labelList[0] = scoreDistLabel;
            chartOptions = [histogramOption(0.25), scoreOption, scoreOption];
            break;
          case "commit":
            labelList[0] = commitDistLabel;
            chartOptions = [
              histogramOption(50),
              noLegendOption,
              noLegendOption,
            ];
            break;
          case "star":
            labelList[0] = starDistLabel;
            chartOptions = [histogramOption(1), noLegendOption, noLegendOption];
            break;
          case "pr":
            labelList[0] = prDistLabel;
            chartOptions = [
              histogramOption(2.5),
              noLegendOption,
              noLegendOption,
            ];
            break;
          case "issue":
            labelList[0] = issueDistLabel;
            chartOptions = [histogramOption(1), noLegendOption, noLegendOption];
            break;
          default:
            console.log("default!!");
        }
        if (chartFactor === "score") {
          dist = json[`year${annual}`][`${factor}${scoreList[scoreIdx]}_dist`];
          sidData =
            json[`year${annual}`][`${factor}${scoreList[scoreIdx]}_sid`];
          deptData =
            json[`year${annual}`][`${factor}${scoreList[scoreIdx]}_dept`];
          sidStd =
            json[`year${annual}`][
              `${factor}${scoreCapitalList[scoreIdx]}SidStd`
            ];
          deptStd =
            json[`year${annual}`][
              `${factor}${scoreCapitalList[scoreIdx]}DeptStd`
            ];
          sidTopData =
            json[`year${annual}`][
              `${factor}${scoreCapitalList[scoreIdx]}SidTop5pct`
            ];
          deptTopData =
            json[`year${annual}`][
              `${factor}${scoreCapitalList[scoreIdx]}DeptTop5pct`
            ];
        } else {
          dist = json[`year${annual}`][`${factor}_dist`];
          sidData = json[`year${annual}`][`${factor}_sid`];
          deptData = json[`year${annual}`][`${factor}_dept`];
          sidStd = json[`year${annual}`][`${factor}SidStd`];
          deptStd = json[`year${annual}`][`${factor}DeptStd`];
          sidTopData = json[`year${annual}`][`${factor}SidTop5pct`];
          deptTopData = json[`year${annual}`][`${factor}DeptTop5pct`];
        }

        topdataRule = [
          [],
          makeScatterData(sidTopData, sidLabel),
          makeScatterData(deptTopData, deptLabel),
        ];
        datasetList = [
          makeHistogramJson(dist, labelList[0]),
          makeErrorJson(sidData, sidStd),
          makeErrorJson(deptData, deptStd),
        ];
        for (let i = 0; i < 3; i++) {
          if (i === 0) {
            chart[i] = makeChart(
              ctx[i],
              chartTypeRule[i],
              chartFactor,
              labelList[i],
              datasetList[i],
              chartColorRule[i],
              chartOptions[i]
            );
          } else {
            chart[i] = makeChart(
              ctx[i],
              chartTypeRule[i],
              chartFactor,
              labelList[i],
              datasetList[i],
              chartColorRule[i],
              {
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              },
              topdataRule[i]
            );
          }
        }
      }

      function makeErrorJson(dataArr, stdArr) {
        let newData = new Array(dataArr.length);

        console.log("dataArr", dataArr);
        for (let i = 0; i < dataArr.length; i++) {
          let errorJson = {};
          errorJson["y"] = Number(dataArr[i]);
          errorJson["yMax"] = Number(
            (Number(dataArr[i]) + Number(stdArr[i])).toFixed(2)
          );
          errorJson["yMin"] = Number(
            (Number(dataArr[i]) - Number(stdArr[i]) < 0
              ? 0
              : Number(dataArr[i]) - Number(stdArr[i])
            ).toFixed(2)
          );
          newData[i] = errorJson;
        }
        console.log("newData", newData);
        return newData;
      }
      function makeHistogramJson(dist, label) {
        let offset = 0;
        //label expect NUM1~NUM2 or NUM
        let newDist = new Array(dist.length);
        let newLabel = new Array(label.length);
        if (dist.length === label.length) {
          for (let i = 0; i < dist.length; i++) {
            if (label[i].indexOf("~") === -1) {
              newLabel[i] = label[i];
              console.log("no~", newLabel[i], i);
            } else {
              newLabel[i] = label[i].split("~")[1];
              if (offset === 0) {
                let temp = label[i].split("~");
                offset = (Number(temp[1]) - Number(temp[0])) / 2;
              }
            }
          }
        } else return dist;
        for (let j = 0; j < dist.length; j++) {
          newDist[j] = {
            x: Number(newLabel[j]) - offset,
            y: dist[j],
          };
        }
        return newDist;
      }

      function createObjArray(size) {
        const arr = new Array(size);
        for (let i = 0; i < size; i++) {
          arr[i] = new Object(null);
        }
        return arr;
      }

      const yearChart = createObjArray(5);
      const yearFactorList = ["score", "commit", "star", "pr", "issue"];

      for (let i = 0; i < 5; i++) {
        yearChart[i] = makeChart(
          ctxYear[i],
          "lineWithErrorBars",
          yearFactorList[i],
          [2019, 2020, 2021],
          makeErrorJson(annualList[i], annualStdList[i]),
          bsPrimary,
          i === 0
            ? {
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: { max: 5, beginAtZero: true },
                },
              } // 그래프 렌더링 문제로 오브젝트자체를 전달하도록함
            : noLegendOption
        );
      }

      // too long text
      controlFontSize();
      function controlFontSize() {
        const numerator = document.getElementsByClassName("text-primary");
        const denominator = document.getElementsByClassName("total");
        const percent = document.getElementsByClassName("percent");
        const kpi = document.getElementsByClassName("kpi");
        for (let i = 0; i < numerator.length; i++) {
          let lenNumer = numerator.item(i).textContent.length;
          let lenDenom = denominator.item(i).textContent.length;
          let lenPercent = percent.item(i).textContent.length;
          console.log(i, lenNumer + lenDenom);
          console.log(
            i,
            numerator.item(i).textContent,
            denominator.item(i).textContent
          );
          if (lenNumer + lenDenom + lenPercent / 2 > 10) {
            kpi.item(i).style.fontSize =
              ((2 / (lenNumer + lenDenom + lenPercent / 2)) * 10).toFixed(2) +
              "rem";
          }
        }
      }

      function makeScatterData(arr2d, label) {
        let ret = [];
        for (let i = 0; i < arr2d.length; i++) {
          for (let j = 0; j < arr2d[i].length; j++) {
            ret.push({ x: label[i], y: arr2d[i][j] });
          }
        }
        console.log("makescatter", ret);
        return ret;
      }
    });
};
