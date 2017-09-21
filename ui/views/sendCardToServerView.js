"use strict";

var base = require("./viewBase");

class StatusView extends base {

    constructor() {
        super();
    }

    check(lines) {
        var that = this;

        if(this.activeAt == null) return false;
        
        lines.line2 = "Sending card...";

        return true;
    }

    setUnactive(){
        this.activeAt = null;
    }
}

module.exports = StatusView;