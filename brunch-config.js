module.exports = {
  paths: {
    public: 'html'
  },
  files: {
    javascripts: {
      joinTo: {
        'javascripts/app.js': /^app/,
        'javascripts/vendor.js': /^vendor/,
        'javascripts/modules.js': /^node_modules/
      },
      order: {
        before: [
          'vendor/lib/beatdetect/fft.js',
          'vendor/lib/postprocessing/EffectComposer.js'
        ]
      }
    },
    stylesheets: {
      joinTo: 'app.css'
    },
    templates: {
      joinTo: 'app.js'
    }
  }
}
