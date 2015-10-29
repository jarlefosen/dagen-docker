(function() {
  var http = require('http');
  var Twit = require('twit');
  var self = {};
  var client = null;
  var isStopped = true;
  var keys = null;
  var tags = null;
  var T = null;
  var STREAM = null;

  var TWITTER_STREAM_ENDPOINT = "statuses/filter";

  var REDIS_LIST = "twitter";
  var PUBLISH_REFRESH = REDIS_LIST + "_refresh";
  var PUBLISH_UPDATED = REDIS_LIST + "_updated";

  function init(tokens, searchTags) {
    tags = searchTags.trim().split(" ");
    keys = tokens;
    T = new Twit(keys);
    console.log("Init twitter mining with tags: " + tags.join(" "));
  }

  function start(redisClient) {
    console.log("TWITTER: Start");
    if (!isStopped) stop();

    isStopped = false;
    client = redisClient;

    fetchFeed();
    startStream();
  }

  function stop() {
    console.log("TWITTER: Stop");
    isStopped = true;
    client = null;
    stopStream();
  }

  function startStream() {
    var selectedTags = tags;
    console.log("Twitter stream, track: " + selectedTags);
    STREAM = T.stream(TWITTER_STREAM_ENDPOINT, {
      'track': tags.join(selectedTags)
    });

    STREAM.on('tweet', function(tweet) {
      var serialized = JSON.stringify(tweet);
      client.lpush(REDIS_LIST, serialized);
      client.publish(PUBLISH_UPDATED, serialized);
    });
  }

  function stopStream() {
    if (STREAM != null)
      STREAM.stop();

    STREAM = null;
  }

  function fetchFeed() {
    T.get('search/tweets', { q: tags.join(","), count: 10 }, function(err, data, response) {
      if (err) {
        console.log("TWITTER: Got error from fetchFeed");
        return;
      }
      onFeedFetched(data.statuses);
    })
  }

  function onFeedFetched(feed) {
    console.log("TWITTER: Feed fetched");
    if (isStopped) return;
    client.del(REDIS_LIST, function() {
      feed.forEach(function(e) {
        client.rpush(REDIS_LIST, JSON.stringify(e));
      });
      client.publish(PUBLISH_REFRESH, JSON.stringify(feed));
    });
  }

  console.log("Setting up twitter mining");

  self.init = init;
  self.start = start;
  self.stop = stop;
  module.exports = self;
})();
