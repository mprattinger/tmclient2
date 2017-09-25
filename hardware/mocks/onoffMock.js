"use strict";

const winston = require("winston");

class OnOffMock{

    constructor(pin){
this.pin = pin;
    }

    watch(callback){
        winston.info("Would wait for input...")
        setTimeout(()=> {
            //callback(null, 1);
        }, 10000);
    }

    write(val, callback){
        winston.info("Would write " + val + " to pin " + this.pin);
        callback(null, val);
    }
}

module.exports = OnOffMock;