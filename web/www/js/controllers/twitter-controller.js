define([
  "app",
  "factories/socket-factory"
], function(app) {
  app.controller("TwitterController", [
    "$scope", "mySocket",
    function($scope, socket) {
      "use strict";

      $scope.twitterFeed = [];
      $scope.twitterCount = $scope.twitterFeed.length;

      function trimTweets() {
        var feed = $scope.twitterFeed || [];
        $scope.twitterFeed = feed.slice(0, 10);
      }

      function addTweet(tweet) {
        $scope.twitterFeed.unshift(tweet);
        trimTweets();
      }

      function setTweets(tweets) {
        $scope.twitterFeed = tweets;
        trimTweets();
      }

      socket.on("twitter_updated", function (data) {
        addTweet(data);
      });

      socket.on("twitter_refresh", function (data) {
        setTweets(data);
      });

    }
  ])
});
