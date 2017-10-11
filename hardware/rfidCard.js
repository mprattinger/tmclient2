"use strict";

const events = require("events");

var readerModule = null;
const os = require("os");
if (os.platform() == "linux") {
    readerModule = require("mfrc522-rpi")
} else {
    readerModule = new require("./mocks/mfrc522-mock");
}

class RfidCard extends events.EventEmitter{
    
    constructor(){
        super();
        this.reader = readerModule;
	this.reader.init();
        this.lastCardDetected = new Date();
    }

    checkCard(){
        var that = this;
        return new Promise((resolve)=>{
            var res = that.reader.findCard();
            if(!res.status) return resolve();
    
            res = null;
            res = that.reader.getUid();
            if(!res.status) return resolve();
    
            //Es wurde eine Karte gefunden -> Debounce prüfen
            var diff = (new Date().getTime() - that.lastCardDetected.getTime()) / 1000;
            diff = Math.round(diff);
            if(diff < 5) return resolve(); //Es wurde bereits eine Karte innerhalb der 5 Sekunden erkannt -> Debounce
    
            that.lastCardDetected = new Date(); //Neuen Debunce setzen
            //CardId ermitteln und senden
            var uid = res.data;
            var uidStr = uid[0].toString(16) + "-" + uid[1].toString(16) + "-" + uid[2].toString(16) + "-" + uid[3].toString(16);
            that.emit("cardDetected", uidStr);
            return resolve();
        });
    }
}

module.exports = RfidCard;
