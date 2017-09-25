"use strict";

const events = require("events");
const winston = require("winston");

var onoff = null;
const os = require("os");
if (os.platform() == "linux") {
    onoff = require("onoff").Gpio;
} else {
    onoff = require("./mocks/onoffMock");
}

class StatusButton extends events.EventEmitter{

    constructor(){
        super();

        this.btn = new onoff(27, "in", "falling", { debounceTimeout: 300 });
    }

    init(){
        var that = this;

        winston.info("Initializing status button....");

        return new Promise((resolve)=>{
            that.btn.watch((err, val)=>{
                if(val == 1) that.emit("statusButtonPressed");
            });
            return resolve();
        });
    }
}

module.exports = StatusButton;