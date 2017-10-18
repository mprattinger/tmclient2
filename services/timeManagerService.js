"use strict";

//const ver = "dev";

const winston = require("winston");
const events = require("events");
const config = require("../package.json");
const httpBase = require("./httpBase");
const httpError = require("./httpError");
const superagent = require("superagent");

class TimeManagerService extends events.EventEmitter {

    constructor() {
        super();

        this.tmApiUrl = "";
    }

    init() {
        var that = this;

        winston.info("Initializing TimeManagerService....")

        return Promise.all([that.loadConfg()]);
    }

    sendCard(uuid, go) {
        var that = this;

        that.loadConfg().then((data) => {
            var payload = that.preparePayload(uuid, (go ? "Out" : "In"));
            winston.info("Payload is " + JSON.stringify(payload));
            return that.sendCardInternal(payload);
        })
        .then(()=>{

        })
        .catch((err) => {
            that.emit("error", err);
        });
    }

    sendCardInternal(payload) {
        var that = this;
        return new Promise((resolve, reject) => {
            superagent.post(that.tmApiUrl)
                .timeout({ response: 5000, deadline: 10000 })
                .set("Content-Type", "application/json")
                .send(payload)
                .end((err, res) => {
                    if (err) {
                        if (err.timeout) {
                            var msg = "When sending ping to server, the request timedout!";
                            winston.error(msg);
                            throw new httpError("Timeout", msg, "Timeout");
                        } else {
                            switch (err.status) {
                                case 400:
                                    winston.error("Bad request send to server");
                                    that.emit("error", new httpError("BadRequest", "Bad request send to server", "Http400"));
                                    break;
                                case 404:
                                    //Die CardId wurde in der Datenbank nicht gefunden und konnte keinen Mitarbeiter zugeordnet werden
                                    winston.warn("CardID was not found in db and no employee could be determined!");
                                    //CardId merken
                                    that.emit("UnknownTagId", uuid);
                                    break;
                                default:
                                    winston.error("StatusCode " + err.status + " not processed!");
                                    that.emit("error", new httpError("UnknownStatusCode", "StatusCode not processed -> " + err.status, err.status));
                                    break;
                            }
                        }
                    } else {
                        //User wurde ein/ausgecheckt
                        winston.info("Received Ok from the server with data " + JSON.stringify(res));
                        //Info anzeigen
                        that.emit("UserRegistered", res.body);
                    }
                });
            resolve();
        });
    }


    preparePayload(uuid, inOut) {
        return {
            "TagUid": uuid,
            "InOut": inOut
        };
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
            that.server = that.config.server;
            that.port = that.config.port;
            that.tmApiUrl = that.server + ":" + that.port + that.config.tmapi;
            winston.info("Resolving tmservice...");
            resolve();
        });
    }
}

const mock = require("superagent-mocker")(superagent);
const mockResponse = require("./mocks/superagent-mock-response");
mock.timeout = 1000;
mock.post("localhost:56507/api/timemanager", (req) => {
    winston.info("Would call path prattpc:80/api/timemanager");
    var data = { "firstName": "Karin", "lastName": "Seidl", "saldo": "12:15" };
    var dataStr = JSON.stringify(data);
    var res = new mockResponse();
    res.body = data;
    res.text = dataStr;
    res.status = 200;
    res.statusCode = this.status;
    winston.info("Http woud send data " + dataStr);
    return res;
});

module.exports = TimeManagerService;
