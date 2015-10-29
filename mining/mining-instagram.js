(function() {
  var redis = require('redis');
  var http = require('https');
  var self = {};
  var client = null;
  var isStopped = true;
  var keys = null;
  var tags = null;
  var intervalID = 0;
  var intervalDelay = 15000; // 15 seconds

  var REDIS_LIST = "instagram";
  var PUBLISH_REFRESH = REDIS_LIST + "_refresh";
  var PUBLISH_UPDATED = REDIS_LIST + "_updated";

  function init(tokens, searchTags) {
    tags = searchTags.trim().split(" ")[0].replace("#", "");
    keys = tokens;
    console.log("Starting instagram mining with tag: " + tags);
  }

  function start(redisClient) {
    console.log("INSTAGRAM: Start");
    if (!isStopped) stop();

    isStopped = false;
    client = redisClient;

    // Fetch feed now
    fetchFeed();
    // Repeat every X milliseconds
    intervalID = setInterval(fetchFeed, intervalDelay); // Repeat every 15 seconds
  }

  function stop() {
    console.log("INSTAGRAM: Stop");
    isStopped = true;
    client = null;
    clearInterval(intervalID);
  }

  function fetchFeed() {
    var auth_query = "access_token=" + keys.access_token;
    var path = '/v1/tags/'+ tags +'/media/recent?count=6&' + auth_query;
    var host = 'api.instagram.com';

    console.log("INSTAGRAM: Fetch: " + host + path);

    var options = {
      host: host,
      path: path,
      method: 'GET'
    };

    var httpreq = http.request(options, function (response) {
      var chunked_response = "";
      response.setEncoding("utf8");

      response.on('data', function(chunk) {
        chunked_response += chunk;
      });

      response.on('error', function(error) {
        console.log("INSTAGRAM: Got error");
        console.log(error);
      });

      response.on('end', function () {
        try {
          onFeedFetched(JSON.parse(chunked_response).data);
        } catch(err) {
          console.log("Could not retreive instagram feed");
          console.log(err);
        }
      });
    });

    httpreq.write("");
    httpreq.end();
  }

  function onFeedFetched(feed) {
    console.log("INSTAGRAM: Feed fetched");
    if (isStopped) return;
    console.log("Set feed to redis:" + REDIS_LIST);
    client.del(REDIS_LIST);
    feed.forEach(function(e) {
      client.rpush(REDIS_LIST, JSON.stringify(e));
    });
    console.log("Publish feed to channel: " + PUBLISH_REFRESH);
    client.publish(PUBLISH_REFRESH, JSON.stringify(feed));
  }

  console.log("Setting up instagram");

  self.init = init;
  self.start = start;
  self.stop = stop;
  module.exports = self;
})();

