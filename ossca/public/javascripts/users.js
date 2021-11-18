$(document).ready(function () {
  $('[data-toggle="tab"]').click(function(e) {
    var $this = $(this),
        loadurl = $this.attr('data-url'),
        targ = $this.attr('href');
    if($this.attr('data-load') == 'false'){
      $.get(loadurl, function(data) {
          $(targ).html(data);
      });
      $this.attr('data-load', 'true')
    }
    $this.tab('show');
    return false;
  });
  $('#owned_repo_tab').click();
});