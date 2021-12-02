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
      $('.repo_row').click(function(e){
        console.log(this.id);
        $('#hover-menu').children().remove();
        $('#hover-menu').append($('<div>').attr("class", "spinner-border text-primary").attr("role", "status"));
        $.get('/ajax/contribute_student/' + this.id, function(data) {
          $('#hover-menu').children().remove()
          $('#hover-menu').html(data);
        });
      });
    }
  });
  $('.dtsp-titleRow').remove();
  $('.dtsp-panesContainer').insertAfter('#scoreTable_filter');
  $('span[title=2021]').click();
});