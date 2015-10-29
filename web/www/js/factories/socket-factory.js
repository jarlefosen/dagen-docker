define([
  "app",
  "angular-socket-io"
], function(app) {
  app.factory('mySocket', [
    "socketFactory",
    function (socketFactory) {
      return socketFactory();
    }]);
});
