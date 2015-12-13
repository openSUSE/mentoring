$(document).ready(function () {
  var url = $('table').first().data('url');
  $.getJSON(url, function (data) {
    console.log(url);
    console.log(data);
    $.each(data, function (index) {

      // Add the rows to the tables
      var row = "<tr><td><a href='#eventModal" + index + "' data-toggle='modal'>" + this.title + "</a></td>" +
          "<td><a href='" + this.html_url + "'" + this.label + "' type='button' class='btn btn-success btn-xs'>Yes, let's do it</a></td>" +
          "<td><a href='" + this.user.html_url + "' type='button' class='btn btn-primary btn-xs'>Contact mentor</a></td>" +
          "</td></tr>";

      $.each(this.labels, function () {
        $('.' + this.name + '-table tbody').append(row);
        $('.' + this.name + '-table').show();
        $('.' + this.name + '-placeholder').remove();
      });

      // Add the modal for the project
      var modal = "<div class='portfolio-modal modal fade' id='eventModal" + index + "' tabindex='-1' role='dialog' aria-hidden='true'> <div class='modal-content'>" +
          "<div class='close-modal' data-dismiss='modal'>" +
          "<div class='lr'>" +
          "<div class='rl'>" +
          "</div></div></div>" +
          "<div class='container'>" +
          "<div class='row'>" +
          "<div class='col-lg-8 col-lg-offset-2'>" +
          "<div class='modal-body'>" +
          "<h2>" + this.title + "</h2>" +
          "<hr class='star-primary'>" +
          "<h3>" + this.title + "</h3>" +
          "<p>" + markdown.toHTML(this.body) + "</p>" +
          "<button type='button' class='btn btn-default' data-dismiss='modal'><i class='fa fa-times'></i>Close</button>" +
          "</div></div></div></div></div></div></div>";
        $('footer').after(modal);

      $('.project-placeholder').html("Sorry but currently we don't have any mentoring project ...")
    });
  });
});


