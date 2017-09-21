"use strict";

var base = require("./viewBase");

class StatusView extends base {

    constructor() {
        super();
        this.go = true;
        this.manuell = false;
    }

    check(lines) {
        var that = this;
        //Beim Inverted gibt es zwei Möglichkeiten
        // -> Zwischen 0 und 10 Uhr soll die Anzeige im Standard immer inverted sein
        // -> Wenn das Active-Flag gesetz wurde -> durch drücken des Buttons^

        var currDate = new Date();
        var hours = currDate.getHours();
        if (hours > 10) {
            that.go = true;
        } else {
            that.go = false;
        }

        if (!that.check_active(that.manuellTime, 5000)) {
            that.manuell = false;
            that.manuellTime = null;
        }

        if (that.manuell) that.go = !that.go;

        if (that.go) {
            lines.line2 = "Gehen";
        } else {
            lines.line2 = "Kommen";
        }

        return false;
    }

    manualOverwrite() {
        this.manuell = true;
        this.manuellTime = new Date();
    }
}

module.exports = StatusView;