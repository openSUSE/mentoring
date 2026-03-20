$(document).ready(function () {
  var $list = $('#github-list').first();
  var baseUrl = $list.data('url');

  if (!baseUrl) return;

  // Fetch all open issues with pagination (GitHub returns 30 per page by default)
  var allIssues = [];
  var page = 1;
  var perPage = 100;

  function fetchIssues() {
    var url = baseUrl + '?state=open&per_page=' + perPage + '&page=' + page;
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      success: function (data, status, xhr) {
        var remaining = xhr.getResponseHeader('X-RateLimit-Remaining');

        if (remaining !== null && parseInt(remaining, 10) <= 0) {
          $('.project-placeholder').html(
            '<div class="alert alert-warning">' +
            'GitHub API rate limit reached. Please view our projects directly on ' +
            '<a href="https://github.com/openSUSE/mentoring/issues">GitHub Issues</a>.' +
            '</div>'
          );
          return;
        }

        if (data && data.length > 0) {
          allIssues = allIssues.concat(data);
          if (data.length === perPage) {
            page++;
            fetchIssues();
          } else {
            renderIssues(allIssues);
          }
        } else {
          renderIssues(allIssues);
        }
      },
      error: function () {
        $('.project-placeholder').html(
          '<div class="alert alert-warning">' +
          'Could not load projects. Please visit ' +
          '<a href="https://github.com/openSUSE/mentoring/issues">GitHub Issues</a> directly.' +
          '</div>'
        );
      }
    });
  }

  function renderMarkdown(text) {
    if (!text) return '<p><em>No description provided.</em></p>';
    try {
      if (typeof marked !== 'undefined') {
        // marked v15+ exports marked.marked or just marked
        var parser = (typeof marked.parse === 'function') ? marked : marked.marked;
        return parser.parse(text);
      }
      // Fallback: escape and wrap in <pre>
      return '<pre>' + $('<span>').text(text).html() + '</pre>';
    } catch (e) {
      return '<pre>' + $('<span>').text(text).html() + '</pre>';
    }
  }

  function getSizeLabel(labels) {
    for (var i = 0; i < labels.length; i++) {
      var name = labels[i].name.toLowerCase();
      if (name.indexOf('small') > -1) return { text: 'Small', class: 'badge-success' };
      if (name.indexOf('medium') > -1) return { text: 'Medium', class: 'badge-warning' };
      if (name.indexOf('large') > -1) return { text: 'Large', class: 'badge-danger' };
    }
    return null;
  }

  function renderIssues(issues) {
    var matched = false;
    $.each(issues, function (index, issue) {
      // Skip pull requests
      if (issue.pull_request) return;

      var mentor = issue.assignee ? issue.assignee.login : issue.user.login;
      var mentorUrl = issue.assignee ? issue.assignee.html_url : issue.user.html_url;
      var sizeLabel = getSizeLabel(issue.labels);
      var sizeBadge = sizeLabel
        ? ' <span class="badge ' + sizeLabel.class + '">' + sizeLabel.text + '</span>'
        : '';

      var row =
        '<div class="list-group-item d-flex justify-content-between align-items-center flex-wrap">' +
          '<span class="mr-2">' +
            '<a href="#issueModal' + issue.number + '" data-toggle="modal">' +
              issue.title +
            '</a>' +
            sizeBadge +
            ' <small class="text-muted">with <a href="' + mentorUrl + '">@' + mentor + '</a></small>' +
          '</span>' +
          '<a href="' + issue.html_url + '" class="btn btn-success btn-sm text-nowrap mt-1">' +
            'More Details' +
          '</a>' +
        '</div>';

      var gsocHint = getGsocHint(issue.labels);
      var body = renderMarkdown(issue.body);

      var modal =
        '<div class="modal fade" id="issueModal' + issue.number + '" tabindex="-1" role="dialog" aria-hidden="true">' +
          '<div class="modal-dialog modal-lg" role="document">' +
            '<div class="modal-content">' +
              '<div class="modal-header">' +
                '<h4 class="mb-0">' + issue.title + '</h4>' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                  '<span aria-hidden="true">&times;</span>' +
                '</button>' +
              '</div>' +
              '<div class="modal-body">' +
                body +
                gsocHint +
                '<a href="' + issue.html_url + '" class="btn btn-success btn-lg mt-3">View on GitHub</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      $.each(issue.labels, function () {
        var $table = $('.' + this.name + '-table');
        if ($table.length) {
          $table.find('.list-group').append(row);
          $table.show();
          $('.' + this.name + '-placeholder').remove();
          matched = true;
        }
      });

      $('body').append(modal);
    });

    // Update any remaining placeholders
    if (!matched) {
      $('.project-placeholder').html(
        "Currently there are no mentoring projects listed. Check back soon or " +
        "<a href='https://github.com/openSUSE/mentoring/issues'>browse our GitHub issues</a>."
      );
    }
  }

  function getGsocHint(labels) {
    var currentUrl = window.location.href;
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].name === 'GSoC') {
        var url = (currentUrl.indexOf('gsoc') > -1) ? currentUrl : currentUrl + '/gsoc/';
        return '<p class="mt-3"><span class="badge badge-info">GSoC</span> This project is eligible for ' +
          '<a href="' + url + '">Google Summer of Code</a>.</p>';
      }
    }
    return '';
  }

  fetchIssues();
});

$(document).on('click', '.close', function () {
  $(this).parents('.show').removeAttr('style');
  $(this).parents('.show').toggleClass('show');
  $('body').toggleClass('modal-open');
  $('body').removeAttr('style');
  $('nav').removeAttr('style');
  $('.modal-backdrop').remove();
});
