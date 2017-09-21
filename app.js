"use strict";

const winston = require("winston");
const logger = require("./logger");
const sockets = require("./sockets/sockets");
const httpServer = require("./server");
const hardware = require("./hardware/hardware");
const uiClass = require("./ui/ui");
const rfidCard = require("./hardware/rfidCard");
const statusBtn = require("./hardware/statusButton");
const buzzer = require("./hardware/buzzer");

const _ = require("lodash");

global.rootDir = __dirname;

class Main {
    constructor() {
        logger.configLogger();
        this.run = true;
    }

    InitApplication() {
        var that = this;
        return new Promise((resolve) => {
            that.webServer = new httpServer();
            that.hardware = new hardware()
            that.ui = new uiClass();
            that.rfidCard = new rfidCard();
            that.statusBtn = new statusBtn();
            that.buzzer = new buzzer();

            Promise.all([that.webServer.runServer(),
            that.hardware.initHardware(),
            that.ui.init(),
            that.statusBtn.init()])
                .then((data) => {
                    that.socket = sockets.listen(that.webServer.server);
                    resolve();
                }).catch((err) => {
                    throw err;
                });

            that.ui.on("lcdUpdate", (data)=>{
                that.lcdUpdate(data);
            });
            that.ui.on("error", (data)=>{});
            that.rfidCard.on("cardDetected", (data)=>{
                that.cardFound(data);
            });
            that.statusBtn.on("statusButtonPressed", ()=>{
                that.statusButtonPressed();
            });
            that.buzzer.on("error", (data)=>{
                winston.error(data.msg, data.error);
            });
        });
    }

    lcdUpdate(data) {
        var that = this;
        if(that.socket) that.socket.emit("lcdUpdated", data);
        winston.info("Lcd updated! line1: " + data.line1 + ", line2: " + data.line2);
    }

    cardFound(data) {
        var that = this;
        //Es wurde ein Chip erkannt
        // -> Beep
        that.buzzer.playSound();
        // -> Info das der Server kontaktiert wird
        var item = _.find(that.ui.views, (item) => {
            return item.name === "sendCardServer";
        });
        if(item) item.view.setActive();
        // -> Call auf Server
    }

    statusButtonPressed(){
        var that = this;
        var item = _.find(that.ui.views, (item)=>{
            return item.name === "statusView";
        });
        if(item) item.view.manualOverwrite();
    }

    RunProgramLoop() {
        var that = this

        setTimeout(() => {
            Promise.all([that.ui.CheckUI(),
            that.rfidCard.checkCard()]).then((data) => {
                if (that.run) return that.RunProgramLoop();
                else winston.info("MainLoop stopped");
            }).catch((err) => {
                winston.error("Error in Main-Loop", err);
            });
        }, 200)
    }
}

var main = new Main();
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