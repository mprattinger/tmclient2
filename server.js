"use strict";

var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var os = require("os");
var winston = require("winston");
var fs = require("fs");
var routesMod = require("./routes")
var json = require("./package.json");

class HttpServer {

    constructor() {

    }

    runServer() {
        var that = this;

        winston.info("Initializing web server...")

        return new Promise((resolve) => {
            that.app = express();

            that.app.use(bodyParser.urlencoded({ extended: true }));
            that.app.use(bodyParser.json());
            that.app.use(cookieParser());
            that.app.use(express.static(path.join(__dirname, "public")));

            that.app.use('/lib', express.static(path.join(__dirname, 'bower_components'));
            that.app.use('/lib2', express.static(path.join(__dirname,'node_modules')));

            that.app.use((req, res, next) => {
                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                res.header("Pragma", "no-cache");
                res.header("Expires", "0");
                next();
            });

            that.app.use((req, res, next) => {
                var body = null;
                if (req.body) body = req.body;
                winston.log("info", req.url, { url: req.url, method: req.method, body: body });
                next();
            });

            //Routes
            that.routes = new routesMod();
            that.app.use("/api", that.routes.router);
            that.app.use((req, res, next) => {
                if(req.url.indexOf("socket.io") != -1) return next();  //Socket.Io ist bei aktivem Browser noch nicht fertig -> Wartet 
                //auf die Promises -> daher fehler ausblenden
                var err = new Error("Not found " + req.url);
                res.status(404);
                next(err);
            });

            // var port = json.settings.ownPort || 8080;
            that.port = json.settings.ownPort;

            that.app.set("port", that.port);
            that.server = that.app.listen(that.app.get("port"), () => {
                winston.log("info", "Express server listening on port " + that.server.address().port);
            });

            winston.info("Resolving webserver...");
            resolve({
                "expressApp": that.app,
                "server": that.server
            });
        });
    }
}




module.exports = HttpServer;
