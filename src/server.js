// libraries
var express = require('express');
var http = require('http');
var path = require('path');
var url = require('url');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');

// own files
var tools = require('./tools');

// app
var app = express();
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname,'public','res','favicon.ico')));

app.set('port', process.env.PORT || 8000);  

var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

app.get("/", (req, res) => {
    console.log("index requested");

    const user = req.query.name ?? (JSON.parse(req.headers.cookie ?? "{}").name ?? "");

    if(!user)
        res.sendFile(path.join(__dirname, "views", "index.html"));
    else
        res.redirect("/calendar");
});

app.get("/calendar", (req, res) => {
    console.log("calendar requested");
    
    const user = req.query.name ?? (JSON.parse(req.headers.cookie ?? "{}").name ?? "");

    if(!user)
        res.redirect("/");
    else
        res.sendFile(path.join(__dirname, "views", "calendar.html"));
});

app.get("/getdata", (req, res) => {
    console.log("data requested");
    
    res.sendFile(tools.GetData(req.query.name));
})

app.post('/nameSubmit', (req, res) => {
    console.log("name submitted");
    
    res.redirect("/calendar?name=" + req.body.name);
  });

app.post('/openDay', (req, res) => {
    console.log("day opened");
    
    res.redirect("/calendar?name=" + req.body.name);
  });