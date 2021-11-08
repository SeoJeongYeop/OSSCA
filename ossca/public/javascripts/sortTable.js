$(document).ready(function () {
  $("th.sort-key").on("click", function () {
    const column = $(this).data("column");
    const order = $(this).attr("data-order");
    const numCol = parseInt(column.replace("col", ""));
    initializeSort(numCol);
    console.log("sortkey was clicked!", column, " ", order);

    if (order === "desc") {
      $(this).attr("data-order", "asc");
    } else if (order === "asc") {
      $(this).attr("data-order", "desc");
    } else {
      $(this).attr("data-order", "desc");
    }
    console.log("repl", numCol);
    console.log("parse ", numCol);
    sortTable(
      document.getElementById("scoreTable"),
      numCol,
      $(this).attr("data-order") === "asc" ? true : false
    );
  });
});

function sortTable(table, column, asc) {
  const isAsc = asc ? 1 : -1;
  console.log("table ", table);
  const tBody = table.tBodies[0];
  console.log("tBody ", tBody);
  const rows = Array.from(tBody.getElementsByTagName("tr"));

  //sort
  const sortedRows = rows.sort((a, b) => {
    let aText = a.getElementsByTagName("td").item(column).textContent.trim();
    let bText = b.getElementsByTagName("td").item(column).textContent.trim();
    if (!isNaN(parseFloat(aText))) {
      aText = parseFloat(aText);
      bText = parseFloat(bText);
    }
    return aText >= bText ? 1 * isAsc : -1 * isAsc;
  });
  console.log(sortedRows);

  //Remove all existing TRs from the table
  while (tBody.firstChild) {
    tBody.removeChild(tBody.firstChild);
  }
  //Re-add the sorted Table
  tBody.append(...sortedRows);
}
function initializeSort(numCol) {
  const sortkey = document.getElementsByClassName("sort-key");
  for (let i = 0; i < sortkey.length; i++) {
    if (i != numCol) {
      console.log("att", sortkey.item(i).getAttribute("data-order"));
      sortkey.item(i).setAttribute("data-order", "none");
    }
  }
}
