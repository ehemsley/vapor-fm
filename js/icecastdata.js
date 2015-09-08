var statusURL = 'http://vapor.fm:8000/status-json.xsl';

(function poll() {
    $.ajax({
        url: statusURL,
        type: "GET",
        success: function(data) {
          document.getElementById('title').innerHTML = data.icestats.source.title;
        },
        failure: function(status) {
          console.log('status: ' + status);
        },
        dataType: "json",
        complete: setTimeout(function() {poll()}, 5000),
        timeout: 2000
    })
})();
