$(document).ready(function () {
  var url = $('#github-list').first().data('url');

  // GitHub allows only 60 API calls per hour from the same IP address,
  // therefore we check first if we have API calls left.
  // If not we display a proper error message!
  var remaining;
  $.ajax({
    url: 'https://api.github.com',
    type: 'GET',
    success: function (data, status, xhr) {
      remaining = xhr.getResponseHeader("X-RateLimit-Remaining");
      if(remaining > 0) {
        $.getJSON(url, function (data) {
          $.each(data, function (index) {

            // Assignee can be nil
            var mentor = this.assignee ? this.assignee.login : this.user.login;
            var mentor_url = this.assignee ? this.assignee.html_url : this.user.html_url;

            // Add the rows to the tables
            var row = "<div class='list-group-item d-flex justify-content-between align-items-center'><span><a href='#eventModal" + index + "' data-toggle='modal'>" + this.title + "</a>" +
                " with <a href='" + mentor_url + "'>" + mentor + "</a></span>" +
                "<a href='" + this.html_url + "' type='button' class='btn btn-success btn-xs'>Let's do it</a></div>";

            $.each(this.labels, function () {
              $('.' + this.name + '-table .list-group').append(row);
              $('.' + this.name + '-table').show();
              $('.' + this.name + '-placeholder').remove();
            });

            gsoc_hint = get_gsoc_hint(this.labels);

            // Add the modal for the project
            var modal = "<div class='modal fade' id='eventModal" + index + "' tabindex='-1' role='dialog' aria-hidden='true'> <div class='modal-content'>" +
                "<div class='modal-header'>" +
                "<h4 class='mb-0'>" + this.title + "</h4>" +
                "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
                "<span aria-hidden='true'>&times;</span>" +
                "</button></div>" +
                "<div class='modal-body'>" +
                markdown.toHTML(this.body) +
                gsoc_hint +
                "<a href='" +
                this.html_url +
                "' type='button' class='btn btn-success btn-lg'>Let's do it</a>" +
                "</div></div></div>";
            $('footer').after(modal);
            $('.project-placeholder').html("Sorry but currently we don't have any mentoring project ...")
          });
        });
      }
      else{
        $('.project-placeholder').html("Sorry but it seems like you exceeded the allowed number of requests. Please have a look at <a href='https://github.com/openSUSE/mentoring/issues'>our issues</a>!")
      }
    }
  });
});

$(document).on('click', '.close', function() {
  $(this).parents('.show').removeAttr('style');
  $(this).parents('.show').toggleClass('show');
  $('body').toggleClass('modal-open');
  $('body').removeAttr('style');
  $('nav').removeAttr('style');
  $('.modal-backdrop').remove();
});

function get_gsoc_hint(labels){
  result = "";
  current_url = window.location.href;
  for(var i = 0; i < labels.length; i++) {
    if (labels[i].name == 'GSoC') {
      if(current_url.indexOf('gsoc') > -1) {
        url = current_url;
      }
      else{
        url = current_url + "/gsoc/";
      }
      result = "<p>You can do this project as part of the Google Summer of Code program. Click <a href='" + url + "'>here</a> for more information.</p>"
      break;
    }
  }
  return result;
}
