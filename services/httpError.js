"use strict";

class HttpError{

    constructor(type, message, error){
        this.type = type;
        this.message = message;
        this.error = error;
    }
}

module.exports = HttpError;