"use strict";

const events = require("events");

var lcdMod = null;
const os = require("os");
if (os.platform() == "linux") {
    lcdMod = require("lcd")
} else {
    lcdMod = require("./mocks/lcdMock");
}

class Lcd extends events.EventEmitter {

    constructor() {
        super();
        
        this.line1 = "";
        this.line2 = "";
        this.dirty = false;
    }

    init() {
        var that = this;
        return new Promise((resolve) => {
            that.cols = 16;
            that.rows = 2;
            that.lcd = new lcdMod({
                rs: 4,
                e: 17,
                data: [18, 22, 23, 24],
                cols: that.cols,
                rows: that.rows
            });

            that.lcd.on("ready", () => {
                that.lcd.clear((err) => {
                    if (err) throw err;
                    resolve();
                });
            });
        });
    }

    updateLcd() {
        var that = this;
        return new Promise((resolve) => {
            if (!that.dirty) return resolve();

            that.clearDisplay().then(() => {
                return new Promise((resolve) => {
                    that.lcd.setCursor(0, 0);
                    that.lcd.print(that.line1);
                    that.lcd.once("printed", () => { resolve(); });
                });
            }).then(() => {
                return new Promise((resolve) => {
                    that.lcd.setCursor(0, 1);
                    that.lcd.print(that.line2);
                    that.lcd.once("printed", () => { resolve(); });
                });
            }).then(() => {
                that.dirty = false;
                resolve({ "line1": that.line1, "line2": that.line2 });
            }).catch((err) => { throw err });
        });
    }

    clearDisplay() {
        var that = this;
        return new Promise((resolve) => {
            that.lcd.clear((err) => {
                if (err) throw err;
                resolve();
            });
        });
    }

    close() {
        this.lcd.close();
    }

    setLine1(text) {
        if (this.line1 != text) {
            this.line1 = text;
            this.dirty = true;
        }
    }
    setLine2(text) {
        if (this.line2 != text) {
            this.line2 = text;
            this.dirty = true;
        }
    }
}

module.exports = Lcd;
