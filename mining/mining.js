var redis = require('redis');

var twitter = require('./mining-twitter');
var instagram = require('./mining-instagram');

var REDIS_PORT = process.env.REDIS_DB_PORT;
var REDIS_HOST = process.env.REDIS_DB_HOST;

var twitter_tags = process.env.TWITTER_TAGS;
var twitter_keys = {
  'consumer_key':       process.env.TWITTER_CONSUMER_KEY,
  'consumer_secret':    process.env.TWITTER_CONSUMER_SECRET,
  'access_token':       process.env.TWITTER_TOKEN_KEY,
  'access_token_secret':process.env.TWITTER_TOKEN_SECRET
};

var instagram_tags = process.env.INSTAGRAM_TAGS;
var instagram_keys = {
  'access_token': process.env.INSTAGRAM_TOKEN_KEY
};

if (!REDIS_PORT) {
  console.error("No REDIS_DB_PORT defined.");
  console.log("Defaulting to REDIS_DB_PORT = 6379");
  REDIS_PORT = 6379;
}

if (!REDIS_HOST) {
  console.error("No REDIS_DB_HOST defined. Exiting");
  process.exit(1);
}

twitter.init(twitter_keys, twitter_tags);
instagram.init(instagram_keys, instagram_tags);

function onRedisDisconnected() {
  twitter.stop();
  instagram.stop();
}

function onRedisConnected(client) {
  twitter.start(client);
  instagram.start(client);
}

var client = redis.createClient(REDIS_PORT, REDIS_HOST)
  .on('error', function() {
    console.log("Connection error -> REDIS at " + REDIS_HOST + ":" + REDIS_PORT);
    onRedisDisconnected();
  })
  .on('reconnecting', function() {
    console.log("Reconnecting -> REDIS at " + REDIS_HOST + ":" + REDIS_PORT);
  })
  .on('ready', function() {
    console.log("Connected -> REDIS at " + REDIS_HOST + ":" + REDIS_PORT);
    onRedisConnected(client);
  });
