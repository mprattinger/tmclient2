"use strict";

const ver = "";//"dev";

const winston = require("winston");
const events = require("events");
const config = require("../package.json");
const httpError = require("./httpError");
const superagent = require("superagent");

class HeartbeatService extends events.EventEmitter {

    constructor() {
        super();

        this.pingUrl = "/ping";
        this.lastCheck = Date.now();
        this.intervalMs = 0;
        this.heartbeatError = false;
        this.sending = false;
    }

    init() {
        var that = this;

        winston.info("Initializing HeartbeatService....")

        return Promise.all([that.loadConfg()]);
    }

    checkNsend() {
        var that = this;
        return new Promise(resolve => {
            that.loadConfg().then((data) => {
                if (!that.pingit()) return resolve();

                winston.info("Sending ping to Server....");
                that.sending = true;
                superagent.get(that.server)
                    .timeout({ response: 5000, deadline: 10000 })
                    .end((err, res) => {
                        that.sending = false;
                        if (err) {
                            if (err.timeout) {
                                var msg = "When sending ping to server, the request timedout!";
                                winston.error(msg);
                                that.heartbeatError = true;
                                that.emit("error", new httpError("Timeout", msg, "Timeout"));
                            } else {
                                var msg = "When sending ping to server, an error occured!";
                                winston.error(msg, err);
                                that.heartbeatError = true;
                                that.emit("error", new httpError("Error", msg, "Error"));
                            }
                        } else {
                            if (res.text == "pong") {
                                winston.info("Successfully received the pong from the server");
                                that.heartbeatError = false;
                                that.emit("ping-ok");
                            } else {
                                var msg = "When sending ping to server, an error occured!";
                                winston.error(msg, err);
                                that.heartbeatError = true;
                                that.emit("error", new httpError("Error", msg, "Error"));
                            }
                        }
                    });
                resolve();
            }).catch((err) => {
                that.heartbeatError = true;
                that.emit("error", err);
            });
        }).catch((err) => {
            that.heartbeatError = true;
            that.emit("error", err);
        });
    }

    loadConfg() {
        var that = this;
        return new Promise((resolve) => {
            //config laden
            that.config = null;
            if (ver == "dev") {
                that.config = config.settings.dev;
            } else {
                that.config = config.settings.prod;
            }
            // that.server = that.config.server;
            // that.port = that.config.port;
            that.server = that.config.server + ":" + that.config.port + that.pingUrl;
            if (that.heartbeatError) that.intervalMs = that.config.heartbeatIntervalErr;
            else that.intervalMs = that.config.heartbeatInterval;
            resolve();
        });
    }

    pingit() {
        var that = this;

        if (that.sending) return false;
        if (!that.lastCheck) return true;

        var checkDate = new Date(that.lastCheck);
        checkDate.setMilliseconds(checkDate.getMilliseconds() + that.intervalMs);

        if (Date.now() > checkDate) {
            that.lastCheck = Date.now();
            return true;
        }
        else return false;
    };
}

if (ver == "dev") {
    const mock = require("superagent-mocker")(superagent);
    const mockResponse = require("./mocks/superagent-mock-response");
    mock.timeout = 1000;
    mock.get("localhost:56507/ping", (req) => {
        winston.info("Would call path prattpc:80/api/timemanager");
        var data = "pong";
        var dataStr = data
        var res = new mockResponse();
        res.body = data;
        res.text = dataStr;
        res.status = 200;
        res.statusCode = this.status;
        winston.info("Http woud send data " + dataStr);
        return res;
    });
}

module.exports = HeartbeatService;
