"use strict";

var base = require("./viewBase");

class UnknownCardView extends base {

    constructor() {
        super();
        this.showTime = false;
    }

    check(lines) {
        var that = this;
        // Auf dem Display soll, die info gezeigt werde, dass dieser Chip nicht erkannt wurde
        if(!that.check_active(that.showTime, 5000)) {
            return false;
        }

        lines.line2 = "Chip n. bekannt!";

        return false;
    }

    setUnknownCard(uuid){
        this.showTime = new Date();
    }
}

module.exports = UnknownCardView;