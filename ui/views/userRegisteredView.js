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
        //Saldo-Berechnung fehlerhaft -> Mal ausblenden und info ausgeben
        this.name = data.firstName + " " + data.lastName;
        //Mal rausnehmen bis Server-Saldo-Calc is save-> this.saldo = data.saldo;
        this.saldo = "registriert!";
        this.showTime = new Date();
    }
}

module.exports = UserRegisteredView;