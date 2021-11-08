$(document).ready(function () {
  const originTable = document.getElementById("scoreTable").cloneNode(true);
  let filteringTable = document.getElementById("scoreTable");
  let columnNameList = [];
  const filterKey = document.getElementsByClassName("filter-key");
  let sizekey = filterKey.length;
  for (let i = 0; i < sizekey; i++) {
    columnNameList.push(filterKey.item(i).textContent.trim());
  }
  console.log("list ", columnNameList);

  console.log("init originTable", originTable);
  console.log("init type", typeof originTable);
  let key = "0";
  let comp = "=";
  let input = "";
  $("#filterKey").change(function () {
    key = this.value; //.replace("col", "");
    key = key.replace("col", "");
    console.log("filterkey was clicked!", key);
    const opt = document.getElementsByClassName("comp-opt");
    const optParent = document.getElementById("comp");
    console.log("len ", opt.length);
    if (0 <= key && key <= 1) {
      if (opt.length === 3) {
        // parent
        console.log("remove...");
        optParent.removeChild(opt.item(2));
        optParent.removeChild(opt.item(1));
        comp = "=";
      }
    } else if (2 <= key && key <= 7) {
      if (opt.length === 1) {
        console.log("append...");
        let biggerOpt = document.createElement("option");
        let smallerOpt = document.createElement("option");
        biggerOpt.setAttribute("class", "comp-opt");
        biggerOpt.setAttribute("value", ">");
        biggerOpt.textContent = ">";
        optParent.appendChild(biggerOpt);

        smallerOpt.setAttribute("class", "comp-opt");
        smallerOpt.setAttribute("value", "<");
        smallerOpt.textContent = "<";
        optParent.appendChild(smallerOpt);
      }
    }
  });
  $("#comp").change(function () {
    console.log("filterkey was clicked!", this.value);
    comp = this.value;
  });
  const condition = document.getElementById("condition");
  condition.addEventListener("input", updateValue);
  function updateValue(e) {
    input = e.target.value;
    console.log(input);
  }

  $("#filterSubmit").on("click", function () {
    //initializeSort();
    console.log("make ", columnNameList[parseInt(key)], comp, input);
    const itemList = document.getElementById("filterItem");
    const keyText = columnNameList[parseInt(key)];
    const tag = document.createElement("div");
    const btnDel = document.createElement("button");
    const iconX = document.createElement("img");
    if (isNaN(parseFloat(input) == false)) input = parseFloat(input);

    iconX.src = "/images/x-icon.svg";
    btnDel.setAttribute("class", "btn-del");
    btnDel.appendChild(iconX);
    btnDel.addEventListener("click", clickRemove);
    function clickRemove(event) {
      initializeSort();
      console.log("click remove", event.target);
      event.target.removeEventListener("click", clickRemove);
      itemList.removeChild(tag);
      console.log("remove itemList ", itemList.children.length);
      console.log(
        "remove origin",
        originTable.tBodies[0].getElementsByTagName("tr").length
      );
      console.log(
        "remove filteringTable",
        filteringTable.tBodies[0].getElementsByTagName("tr").length
      );
      let listLen = itemList.children.length;
      console.log("listLen ", itemList.children.length);
      let cloneTable = originTable.cloneNode(true);
      // if (listLen === 0) {

      // }
      console.log(
        "init clone Table",
        cloneTable.tBodies[0].getElementsByTagName("tr").length
      );
      console.log(
        "filteringTable",
        filteringTable.tBodies[0].getElementsByTagName("tr").length
      );
      filteringTable = filterTable(cloneTable, "", "", ""); //우선 초기화
      console.log(
        "init filteringTable",
        filteringTable.getElementsByTagName("tr").length
      );

      for (let k = 0; k < listLen; k++) {
        let item = itemList.children.item(k);
        let eleList = item.textContent.split(/[=><]/);
        let reComp = item.textContent.match(/[=><]/)[0];
        console.log("re ", eleList[0].trim(), reComp, eleList[1].trim());
        console.log("list", columnNameList);
        let reKey = columnNameList.indexOf(eleList[0].trim());
        // .filter((ele) => {
        //   return ele === eleList[0].trim();
        // });
        filteringTable = filterTable(
          filteringTable,
          reKey,
          reComp,
          eleList[1].trim()
        );
      }
      return;
    }
    console.log("add itemList ", itemList.children);
    console.log(
      "add origin",
      originTable.tBodies[0].getElementsByTagName("tr").length
    );
    console.log(
      "add filteringTable",
      filteringTable.tBodies[0].getElementsByTagName("tr").length
    );
    tag.setAttribute("class", "tag-condition");
    tag.textContent = keyText + " " + comp + " " + input;
    tag.appendChild(btnDel);
    itemList.appendChild(tag);
    filteringTable = filterTable(filteringTable, key, comp, input);
  });
});
function initializeSort() {
  const sortkey = document.getElementsByClassName("sort-key");
  for (let i = 0; i < sortkey.length; i++) {
    console.log("att", sortkey.item(i).getAttribute("data-order"));
    sortkey.item(i).setAttribute("data-order", "none");
  }
}
function filterTable(table, column, comp, input) {
  console.log(
    "para table1 ",
    table.tBodies[0].getElementsByTagName("tr").length
  );
  console.log("para others ", column, comp, input);
  console.log("new tbody", table.getElementsByTagName("tbody"));
  const tBody = table.tBodies[0];
  const tBodyRows = table.tBodies[0].getElementsByTagName("tr");
  console.log("para table1.tbodies1", table.tBodies[0]);
  console.log("tBody ", tBody);
  console.log(
    "para table1 again2",
    table.tBodies[0].getElementsByTagName("tr").length
  );
  const rows = Array.from(tBodyRows);
  if (column === "" && comp === "" && input == "") {
    let presentTable = document.getElementById("scoreTable");
    let ptBody = presentTable.tBodies[0];
    console.log("refind table", ptBody.getElementsByTagName("tr").length);
    console.log("reset");
    //Remove all existing TRs from the table
    while (ptBody.firstChild) {
      console.log("del!!!");
      ptBody.removeChild(ptBody.firstChild);
    }
    //Re-add the sorted Table
    console.log("...rows", rows);
    ptBody.append(...rows);
    console.log("para table2 ", table);
    console.log("return table2 ", presentTable);
    return presentTable /*.cloneNode(true)*/;
  } else {
    let filtering;
    if (comp === "=") {
      console.log("select =");
      filtering = function (row) {
        return (
          row.getElementsByTagName("td").item(column).textContent.trim() ===
          input
        );
      };
    } else if (comp === ">") {
      console.log("select >");
      filtering = function (row) {
        if (isNaN(parseFloat(input))) return false;
        return (
          parseFloat(
            row.getElementsByTagName("td").item(column).textContent.trim()
          ) > parseFloat(input)
        );
      };
    } else if (comp === "<") {
      console.log("select <");
      filtering = function (row) {
        if (isNaN(parseFloat(input))) return false;
        return (
          parseFloat(
            row.getElementsByTagName("td").item(column).textContent.trim()
          ) < parseFloat(input)
        );
      };
    }
    const filteredRows = rows.filter((row) => {
      return filtering(row);
    });
    console.log("filteredRows ", filteredRows);

    //Remove all existing TRs from the table
    while (tBody.firstChild) {
      tBody.removeChild(tBody.firstChild);
    }

    //Re-add the sorted Table
    tBody.append(...filteredRows);
    console.log("para table 3 ", table);
    return table;
  }
}
