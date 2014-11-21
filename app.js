/**
 * Module dependencies.
 */
var express = require('express');
// var routes = require('./routes');
var http = require('http');
var app = express();
var url = require("url");
var fs = require("fs");

var debug = false;


// all environments
app.set('port', '9001');
app.use(express.logger('dev'));
app.use(express.json());

app.use(express.urlencoded());
app.use(express.methodOverride());

// enable CORS to allow the server to respond to ajax requests
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


// IPs that are allowed to request from this server
whitelist = fs.readFileSync('whitelist.txt').toString().replace(/\r/gi, "").split("\n");

humerousRedirects = ["http://www.asciiartfarts.com/random.cgi", "http://wikihow.com/Special:Randomizer",
                    "http://en.wikipedia.org/wiki/Special:Random", "http://randomcolour.com/",
                    "http://wordsmith.org/words/random.cgi", "http://www.randomhaiku.com/",
                    "http://www.reddit.com/r/random", "http://poetryoutloud.org/poems-and-performance/random-poem"];

app.get("/", function(req, res) {
    if (whitelist.indexOf(req.ip) === -1) {
        console.log(req.ip);
        res.redirect(humerousRedirects[Math.floor(Math.random() * humerousRedirects.length)]);
        return;
    }
    res.send("oh... hi.");
});

app.get("/curl4me", function(req, res) {
    if (whitelist.indexOf(req.ip) === -1) {
        res.redirect(humerousRedirects[Math.floor(Math.random() * humerousRedirects.length)]);
        return;
    }
    res.status(500).send("post, not get.");
});

app.post("/curl4me", function(req, res) { 
    if (whitelist.indexOf(req.ip) === -1) {
        res.status(403).send("Uh-Uh-Uhhh");
    }

    var targetUrl = url.parse(req.body.url);
    if (targetUrl.port === null) {
        targetUrl.port = 80;
    }

    // TODO: add caching & check if host+path is cached in db
    // if not precached, go ahead with the request
    
    var options = {
        host: targetUrl.host,
        port: targetUrl.port,
        path: targetUrl.path
    }

    http.get(options, function(reply) {
        log(reply);
        var body = "";

        // data is still streaming in
        reply.on('data', function(chunk) {
            log("chunk");
            body += chunk;
        });
        // data has come to an end, send it back to the requester
        reply.on('end', function(chunk) {
            log(body);
            res.json({result: body});
            // store result in redis or w/e
        });
    }).on('error', function(err) {
        res.status(500);
    });
});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

function log(msg) {
    if (debug) {
        console.log("SRV: " + msg);
    }
}
