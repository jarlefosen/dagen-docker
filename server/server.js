
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var redis = require('redis');

var APP_PORT = process.env.APP_PORT || 3000;

var REDIS_PORT = process.env.REDIS_DB_PORT;
var REDIS_HOST = process.env.REDIS_DB_HOST;

if (!REDIS_PORT) {
  console.error("No REDIS_DB_PORT defined.");
  console.log("Defaulting to REDIS_DB_PORT = 6379");
  REDIS_PORT = 6379;
}

if (!REDIS_HOST) {
  console.error("No REDIS_DB_HOST defined. Exiting");
  process.exit(1);
}

var client = null;

app.get('/', function(req, res) {
  res.send("Application running at local port: " + APP_PORT);
});

app.get('/twitter/', function(req, res) {
  if (client === null) {
    httpNoRedis(res);
    return;
  }

  getTwitterFeed(function(data) {
    res.send(data);
  });

/*
  client.lrange("twitter", 0, 10, function(err, data) {
    if (!!err) {
      httpNoRedis(res, err);
      return;
    }

    res.send(data.map(function(e) {
      return JSON.parse(e);
    }));

  });
*/
});

app.get('/instagram/', function(req, res) {
  if (client === null) {
    httpNoRedis(res);
    return;
  }

  getInstagramFeed(function(data) {
    res.send(data);
  });
});

function getTwitterFeed(callback) {
  if (client === null) {
    callback([]);
    return;
  }

  client.lrange("twitter", 0, 10, function(err, data) {
    if (!!err) {
      callback([]);
      return;
    }

    data = data.map(function(e) {
      return JSON.parse(e);
    });

    callback(data);
  });
}

function getInstagramFeed(callback) {
  if (client === null) {
    callback([]);
    return;
  }

  client.lrange("instagram", 0, 10, function(err, data) {
    if (!!err) {
      callback([]);
      return;
    }

    data = data.map(function(e) {
      return JSON.parse(e);
    });

    callback(data);
  });
}

function httpNoRedis(res, err) {
  res.status(500).send("We're experiencing some problems with our DB... Please check back soon!\n" + err);
}

io.on('connection', function(socket) {
  console.log("User connected");

  getTwitterFeed(function(data) {
    socket.emit("twitter_refresh", data);
  });

  getInstagramFeed(function(data) {
    socket.emit("instagram_refresh", data);
  });

/*
  socket.on('message', function (from, msg) {

    io.sockets.emit('broadcast', {
      payload: msg,
      source: from
    });
    console.log('broadcast complete');
  });
*/
});

var emitCount = 0;

setInterval(function() {
  io.sockets.emit('heartbeat', {
    payload: "Heart Beat <3 " + emitCount++
  });
}, 1000);

function connectRedisSubscribe() {
  var mClient = redis.createClient(REDIS_PORT, REDIS_HOST)
    .on('error', function() {
      console.log("Connection error -> REDIS Subscribe at " + REDIS_HOST + ":" + REDIS_PORT);
    })
    .on('reconnecting', function() {
      console.log("Reconnecting -> REDIS Subscribe at " + REDIS_HOST + ":" + REDIS_PORT);
    })
    .on('ready', function() {
      console.log("Connected -> REDIS Subscribe at " + REDIS_HOST + ":" + REDIS_PORT);
    });

  mClient.subscribe("twitter_refresh");
  mClient.subscribe("twitter_updated");
  mClient.subscribe("instagram_refresh");
  mClient.subscribe("instagram_updated");
  mClient.on("message", function(channel, message) {
    io.sockets.emit(channel, JSON.parse(message));
  });
}

function connectRedis() {
  client = redis.createClient(REDIS_PORT, REDIS_HOST)
    .on('error', function() {
      console.log("Connection error -> REDIS at " + REDIS_HOST + ":" + REDIS_PORT);
    })
    .on('reconnecting', function() {
      console.log("Reconnecting -> REDIS at " + REDIS_HOST + ":" + REDIS_PORT);
    })
    .on('ready', function() {
      console.log("Connected -> REDIS at " + REDIS_HOST + ":" + REDIS_PORT);
    });
}

connectRedisSubscribe();
connectRedis();

app.use(function(req, res, next) {
  console.log("Client connected to:" + req.url);
  next();
});

console.log("App listening on port " + APP_PORT);
http.listen(APP_PORT);
