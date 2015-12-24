exports.config =
  # See http://brunch.io/#documentation for docs.
  files:
    javascripts:
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^vendor/
      order:
        before: [
          'vendor/lib/jquery-2.1.4.min.js',
          'vendor/lib/three.min.js',
          'vendor/lib/beatdetect/fft.js'
        ]
    stylesheets:
      joinTo: 'app.css'
    templates:
      joinTo: 'app.js'
