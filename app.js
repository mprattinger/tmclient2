"use strict";

const winston = require("winston");
const logger = require("./logger");
const sockets = require("./sockets/sockets");
const httpServer = require("./server");
const uiClass = require("./ui/ui");
const rfidCard = require("./hardware/rfidCard");
const statusBtn = require("./hardware/statusButton");
const buzzer = require("./hardware/buzzer");
const tmService = require("./services/timeManagerService");
const heartBeat = require("./services/heartbeatService");

const _ = require("lodash");

global.rootDir = __dirname;

class Main {
    constructor() {
        logger.configLogger();
        this.run = true;
    }

    InitApplication() {
        var that = this;
        
        winston.info("Initializing application....");

        return new Promise((resolve) => {
            that.webServer = new httpServer();
            that.ui = new uiClass();
            that.rfidCard = new rfidCard();
            that.statusBtn = new statusBtn();
            that.buzzer = new buzzer();
            that.tmService = new tmService(this.devMode);
            that.heartBeat = new heartBeat(this.devMode);

            Promise.all([that.webServer.runServer(),
            that.ui.init(),
            that.statusBtn.init(),
            that.tmService.init(),
            that.heartBeat.init()])
                .then((data) => {
                    winston.info("Application initialized! Run socket.io....")
                    that.socket = sockets.listen(that.webServer.server);
                    resolve();
                }).catch((err) => {
                    throw err;
                });

            that.ui.on("lcdUpdate", (data) => {
                that.lcdUpdate(data);
            });
            that.ui.on("error", (data) => { });
            that.rfidCard.on("cardDetected", (uuid) => {
                that.cardFound(uuid);
            });
            that.statusBtn.on("statusButtonPressed", () => {
                that.statusButtonPressed();
            });
            that.buzzer.on("error", (data) => {
                winston.error(data.msg, data.error);
            });
            that.tmService.on("UserRegistered", (data) => {
                var item = _.find(that.ui.views, (item) => {
                    return item.name === "sendCardServer";
                });
                if (item) item.view.setUnactive();
                item = null;
                var item = _.find(that.ui.views, (item) => {
                    return item.name === "userRegistered";
                });
                if (item) item.view.setRegistered(data);
            });
            that.tmService.on("UnknownTagId", (uuid) => {
                //Info anzeigen
                var item = _.find(that.ui.views, (item) => {
                    return item.name === "sendCardServer";
                });
                if (item) item.view.setUnactive();
                item = null;
                item = _.find(that.ui.views, (item) => {
                    return item.name === "unknownCard";
                });
                if (item) item.view.setUnknownCard(uuid);
                //Chip speichern
            });
            that.tmService.on("error", (err) => {
                winston.error(err.message, err.error);
                var item = _.find(that.ui.views, (item) => {
                    return item.name === "sendCardServer";
                });
                if (item) item.view.setUnactive();
                item = null;
                item = _.find(that.ui.views, (item) => {
                    return item.name === "error";
                });
                if (item) item.view.setError("Error", err.type);
            });
            that.heartBeat.on("ping-ok",()=>{

            });
            that.heartBeat.on("error", (err)=>{
                var item = _.find(that.ui.views, (item) => {
                    return item.name === "error";
                });
                if (item) item.view.setError("Check conn.", err.type);
            });
        });
    }

    lcdUpdate(data) {
        var that = this;
        if (that.socket) that.socket.emit("lcdUpdated", data);
        winston.info("Lcd updated! line1: " + data.line1 + ", line2: " + data.line2);
    }

    cardFound(uuid) {
        var that = this;
        //Es wurde ein Chip erkannt
        // -> Beep
        that.buzzer.playSound();
        // -> Info das der Server kontaktiert wird
        var item = _.find(that.ui.views, (item) => {
            return item.name === "sendCardServer";
        });
        if (item) item.view.setActive();
        // -> Call auf Server
        var status = _.find(that.ui.views, (item) => {
            return item.name === "statusView";
        });
        winston.info("Sending card to server uuid: " + uuid + ", status is: " + status.view.go);
        that.tmService.sendCard(uuid, status.view.go);
    }

    statusButtonPressed() {
        var that = this;
        var item = _.find(that.ui.views, (item) => {
            return item.name === "statusView";
        });
        if (item) item.view.manualOverwrite();
    }

    RunProgramLoop() {
        var that = this

        setTimeout(() => {
            Promise.all([that.ui.CheckUI(),
            that.rfidCard.checkCard(),
            that.heartBeat.checkNsend()]).then((data) => {
                if (that.run) return that.RunProgramLoop();
                else winston.info("MainLoop stopped");
            }).catch((err) => {
                winston.error("Error in Main-Loop", err);
            });
        }, 200)
    }

    setDevMode(){
        this.devMode = true;
    }
}

var main = new Main();

if(process.argv.length > 0){
    if(_.find(process.argv, (argv)=>{
        return argv === "-d" || argv == "--dev"; 
    })) main.setDevMode();
}

main.InitApplication().then((data) => {
    winston.info("TMC gestartet!");
    main.RunProgramLoop();
}).catch((err) => {
    winston.error("An error occured when initializing the app", err);
});

// Catch CTRL+C
process.on('SIGINT', () => {
    main.run = false;
    console.log('\nCTRL+C...');
    process.exit(0);
});