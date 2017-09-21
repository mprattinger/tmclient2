"use strict";

class ViewBase{

    constructor(){
        this.line1 = "";
        this.line2 = "";
        this.activeAt = null
    }

    check(lines){

    }

    check_active(shownAt, tts) {
        if(!shownAt) return false;
        //Prüfen ob es immer noch gezeigt werden soll:
        var checkDate = new Date(shownAt);
        checkDate.setMilliseconds(checkDate.getMilliseconds() + tts);
        if (Date.now() > checkDate) {
            return false;
        } else {
            return true;
        }
    };

    setActive(){
        this.activeAt = new Date();
    }
}

module.exports = ViewBase;