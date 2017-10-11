"use strict";

var base = require("./viewBase");

class ErrorView extends base {

    constructor() {
        super();
        this.showTime = false;
        this.errorLine1 = "";
        this.errorLine2 = "";
    }

    check(lines) {
        var that = this;
        //Beim Inverted gibt es zwei Möglichkeiten
        // Auf dem Display soll, wenn aktiv, in der ersten Zeile der Name des Mitarbeiters und in der zweiten Zeile der Saldo
        if (!that.check_active(that.showTime, 5000)) {
            that.errorLine1 = "";
            that.errorLine2 = "";
            return false;
        }

        lines.line1 = that.errorLine1;
        lines.line2 = that.errorLine2;

        return true;
    }

    setError(errorLine1, errorLine2) {
        this.errorLine1 = errorLine1;
        this.errorLine2 = errorLine2
        this.showTime = new Date();
    }
}

module.exports = ErrorView;