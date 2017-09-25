"use strict";

var base = require("./viewBase");

class UserRegisteredView extends base {

    constructor() {
        super();
        this.showTime = false;
        this.name = "";
        this.saldo = "";
    }

    check(lines) {
        var that = this;
        //Beim Inverted gibt es zwei Möglichkeiten
        // Auf dem Display soll, wenn aktiv, in der ersten Zeile der Name des Mitarbeiters und in der zweiten Zeile der Saldo
        if(!that.check_active(that.showTime, 5000)) {
            that.name = "";
            that.saldo = "";
            return false;
        }

        lines.line1 = that.name;
        lines.line2 = that.saldo;

        return true;
    }

    setRegistered(data){
        this.name = data.firstName + " " + data.lastName;
        this.saldo = data.saldo;
        this.showTime = new Date();
    }
}

module.exports = UserRegisteredView;