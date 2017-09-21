"use strict";

const winston = require("winston");
const config = require("../package.json");
const httpBase = require("./httpBase");
const httpError = require("./httpError");

class TimeManagerService extends httpBase {

    constructor(){
        super();

        this.server = "";
        this.port = 0;
        this.tmApiUrl = "";
    }

    init(){
        var that = this;
        return Promise.all([that.loadConfg()]);
    }

    sendCard(uuid, go){
        var that = this;
        loadConfg().then((data)=>{
            var payload = that.preparePayload(uuid, (go ? "Out" : "In"));
            winston.info("Payload is " + JSON.stringify(payload));

            var options = that.prepareOptions("POST", that.tmApiUrl);

            that.postRequest(options, payload).then((data)=>{
                switch (data.statusCode) {
                    case 200:
                        //User wurde ein/ausgecheckt
                        winston.info("Received Ok from the server with data " + JSON.stringify(data.data));
                        //Info anzeigen
                        that.emit("UserRegistered", data.data);
                        break;
                    case 400:
                        winston.error("Bad request send to server");
                        throw new httpError("BadRequest", "Bad request send to server", "Http400");
                        break;
                    case 404:
                        //Die CardId wurde in der Datenbank nicht gefunden und konnte keinen Mitarbeiter zugeordnet werden
                        winston.warn("CardID was not found in db and no employee could be determined!");
                        //CardId merken
                        that.emit("UnknownTagId", uuid);
                        break;
                    default:
                        winston.error("StatusCode " + data.statusCode + " not processed!");
                        throw new httpError("UnknownStatusCode", "StatusCode not processed -> " + data.statusCode, data.statusCode);
                        break;
                }
            }).catch((err)=>{
                throw err;
            });
        }).catch((err)=>{
            that.emit("error", err);
        });
    }

    preparePayload(uuid, inOut){
        return {
            "TagUid": uuid,
            "InOut": inOut
        };
    }

    loadConfg(){
        var that = this;
        return new Promise((resolve)=>{
            //config laden
            that.config = null;
            if(ver == "dev"){
                that.config = config.settings.dev;
            } else {
                that.config = config.settings.prod;
            }
            that.server = that.config.server;
            that.port = that.config.port;
            that.tmApiUrl = that.config.tmapi;
        });
    }
}

module.exports = TimeManagerService;