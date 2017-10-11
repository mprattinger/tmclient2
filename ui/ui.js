"use strict";

const winston = require("winston");
const lcdMod = require("../hardware/lcd");
const dateFormat = require("dateformat");
const statusViewMod = require("./views/statusView");
const sendCardServerMod = require("./views/sendCardToServerView");
const userRegisteredMod = require("./views/userRegisteredView");
const unknowCardMod = require("./views/unknownCardView");
const errorView = require("./views/errorView");

class UI extends lcdMod {

    constructor() {
        super();

        this.views = [];
        this.views.push({ name: "statusView", view: new statusViewMod()});
        this.views.push({ name: "sendCardServer", view: new sendCardServerMod()});
        this.views.push({ name: "userRegistered", view: new userRegisteredMod()});
        this.views.push({ name: "unknownCard", view: new unknowCardMod()});
        this.views.push({ name: "error", view: new errorView()});
    }

    CheckUI() {
        var that = this;
        return new Promise((resolve) => {
            //Mal die Zeit in die erste Zeile schreiben
            var lines = {};
            lines.line1 = that._getTimeLine();
            lines.line2 = "";

            for(var item of that.views){
                var br = item.view.check(lines);
                if(br) break;
            }

            that.setLine1(lines.line1);
            that.setLine2(lines.line2);
            that.updateLcd().then((data) => {
                if(!data) return resolve(data);
                that.emit("lcdUpdate", data)
                resolve(data);
            }).catch((err) => {
                that.emit("error", err);
                throw err;
            });
        });
    }

    _getTimeLine() {
        var now = new Date();
        return dateFormat(now, "dd.mm.yyyy") + " " + dateFormat(now, "HH:MM");
    }
}

module.exports = UI;