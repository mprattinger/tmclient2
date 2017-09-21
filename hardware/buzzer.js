"use strict";

const winston = require("winston");
const events = require("events");

var onoff = null;
const os = require("os");
if (os.platform() == "linux") {
    onoff = require("onoff").Gpio;
} else {
    onoff = require("./mocks/onoffMock");
}

class Buzzer extends events.EventEmitter {

    constructor(){
        super();
        this.buzzer = new onoff(5, "out");
    }

    playSound(){
        var that = this;
        that.buzzer.write(1, (err, val)=>{
            if(err){
                that.emit("error", { msg: "Error buzzer on", error: err});
                return;
            }
            winston.info("Buzzer playing sound!");
            setTimeout(()=>{
                that.buzzer.write(0, (err, val)=>{
                    if(err){
                        that.emit("error", { msg: "Error buzzer off", error: err});
                        return;
                    }
                    winston.info("Buzzer off");
                    that.emit("finished");
                });
            }, 1000);
        });
    }
}

module.exports = Buzzer;