"use strict";

const events = require("events");
const winston = require("winston");

function requestCall(options, resCb) {
    var res = new HttpMockResult(options)
    resCb(res);

    return new HttpMockRequest();
}

class HttpMockResult extends events.EventEmitter {

    constructor(options) {
        super();
        this.options = options;

        this.statusCode = 200;
        this.headers = {};

        this.run();
    }

    run() {
        var that = this;
        if(that.options.path == "/api/timemanager" ){
            winston.info("Would call path " + that.options.path);
            setTimeout(() => {
                var data = { "firstName": "Karin", "lastName": "Seidl", "saldo": "12:15" };
                var dataStr = JSON.stringify(data);
                winston.info("Http woud send data " + dataStr);
                that.emit("data", Buffer.from(dataStr, "utf8"));
                setTimeout(() => {
                    winston.info("Sending Http request end");
                    that.emit("end");
                }, 500);
            }, 500);
        }
    }

}

class HttpMockRequest extends events.EventEmitter {

    constructor(){
        super();
    }

    write(data){

    }

    end(){

    }
}

module.exports = {
    request: requestCall
}