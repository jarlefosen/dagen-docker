define([
  "app",
  "factories/socket-factory"
], function(app) {
  app.controller("InstagramController", [
    "$scope", "mySocket",
    function($scope, socket) {
      "use strict";

      $scope.instagramFeed = [];
      $scope.instaCount = $scope.instagramFeed.length;

      function trimData() {
        var feed = $scope.instagramFeed || [];
        $scope.instagramFeed = feed.slice(0, 10);
      }

      function addData(data) {
        $scope.instagramFeed.unshift(data);
        trimData();
      }

      function setData(data) {
        $scope.instagramFeed = data;
        trimData();
      }

      socket.on("instagram_updated", function (data) {
        addData(data);
      });

      socket.on("instagram_refresh", function (data) {
        setData(data);
      });


    }
  ])
});
