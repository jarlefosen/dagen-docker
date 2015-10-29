require.config({
  paths: {
    "angular": "../bower_components/angular/angular",
    "angular-socket-io": "../bower_components/angular-socket-io/socket",
    "socket-io": "../bower_components/socket.io-client/socket.io"
  },
  shim: {
    "angular": { exports: "angular" },
    "angular-socket-io": ["angular"]
  }
});

require([
  "angular",
  "app",
  "socket-io"
], function(angular, app, socket) {
  "use strict";

  /* Will launch on app startup */
  function bootstrap() {
    window.io = socket;
    require([
      "controllers/twitter-controller",
      "controllers/instagram-controller"
    ], function() {
      app.run();
      angular.bootstrap(document, ["app"]);
    })
  }

  /* If running on Cordova, wait for device ready to bootstrap */
  if (!!window.cordova) {
    document.addEventListener("deviceready", bootstrap, false);
  } else {
    bootstrap();
  }

});
