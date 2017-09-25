"use strict";

const winston = require("winston");

class Hardware{

    constructor(){
    }
    
    initHardware(){
        winston.info("Initializing hardware....");

        return new Promise((resolve)=>{
            resolve();
        });
    }
}

module.exports = Hardware;