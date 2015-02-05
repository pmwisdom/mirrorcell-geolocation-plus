Package.describe({
    name: 'mirrorcell:geolocation-plus',
    version: '1.0.3',
    // Brief, one-line summary of the package.
    summary: 'A Geolocation Package with Manual Stop / Start Watch events',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/pmwisdom/mirrorcell-geolocation-plus',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: ''
});

Cordova.depends({
    "org.apache.cordova.geolocation": "0.3.11"
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');

    api.use(['session', 'reactive-var']);

    api.addFiles('lib/location.js');

    api.export('Location');
});

Package.onTest(function(api) {
});
