$(document).ready(function () {
  var table = $('#scoreTable').DataTable({
    searchPanes: {
      viewTotal: true,
      orderable: false,
      columns: [7],
      initCollapsed: true,
    },
    dom: 'Pfrtip',
    columnDefs: [
      {
        orderable: false,
        targets:[0, 7]
      },
      {
        targets:[4]
      }
    ],
    order: [[1, 'desc']],
    drawCallback: function( settings ) {
      var now_page = parseInt($('.page-item.active > a').html());
      var table_rows = $.find('.rank');
      for(idx in table_rows){
        $(table_rows[idx]).html((now_page - 1) * 10 + parseInt(idx) + 1);
      }
    }
  });
  $('.dtsp-titleRow').remove();
  $('.dtsp-panesContainer').insertAfter('#scoreTable_filter');
  $('span[title=2021]').click();
  $('.repo_row').mouseover(function(e){
    console.log(e)
  });
  $('.repo_row').mousemove(function(e){
    console.log(e.pageX, e.pageY)
    $('.hover-menu').css({
      "top": e.pageX,
      "left": e.pageY,
      "position":"fixed"
    }).show();
  });
});