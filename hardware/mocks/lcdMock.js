"use strict";

const events = require("events");

class LcdMock extends events.EventEmitter {

    constructor(){
        super();
        var that = this;
        setTimeout(()=>{
            that.emit("ready");
        }, 1000);
    }

    clear(cb){
        cb();
    }

    print(text){
        var that = this;
        setTimeout(()=>{
            that.emit("printed");
        }, 300);
    }

    close(){

    }

    setCursor(col, row){
        
    }
}

module.exports = LcdMock;