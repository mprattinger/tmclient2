"use strict";

const winston = require("winston");
const config = require("../package.json");

const ver = "dev";

var http = require("http");
const os = require("os");
if(ver == "dev"){
    http = require("./mocks/httpMock");
}

class TimeManagerService {

    constructor(){
        
        this.server = "";
        this.port = 0;
        this.tmApiUrl = "";
    }

    init(){
        var that = this;
        return new Promise((resolve)=>{
            //config laden
            that.config = null;
            if(ver == "dev"){
                that.config = config.settings.dev;
            } else {
                that.config = config.settings.prod;
            }
        });
    }

}

module.exports = TimeManagerService;