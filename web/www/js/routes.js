define([
  "app",
  "controllers/index-controller",
  "controllers/twitter-controller",
  "controllers/instagram-controller",
  "controllers/navbar-controller"
], function(app) {
  "use strict";

  app.config([
    "$routeProvider",
    function($routeProvider) {
      $routeProvider
      .when("/", {
        templateUrl: "partials/index.html",
        controller: "IndexController"
      })
      .otherwise({
        redirectTo: "/"
      });
    }
  ]);
});
