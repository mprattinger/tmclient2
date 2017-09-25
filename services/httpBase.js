"use strict";

const ver = "dev";

var http = require("http");
const os = require("os");
if(ver == "dev"){
    http = require("./mocks/http-mock");
}
const httpError = require("./httpError");

const events = require("events");

class HttpBase extends events.EventEmitter {

    constructor(){
        super();

        this.server = "";
        this.port = 0;
    }

    prepareOptions(method, path){
        var that = this;
        return {
            "hostname": that.server,
            "port": that.port,
            "path": path,
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        };
    }

    getRequest(options){
        return new Promise((resolve)=>{
            var req = http.request(options, (res)=>{
                let result = {};
                result.statusCode = res.statusCode;
                result.headers = res.headers;
                let bodyChunks = [];

                res.on("data", (chunk)=>{
                    bodyChunks.push(chunk);
                });
                res.on("end", ()=>{
                    let body = Buffer.concat(bodyChunks).toString();
                    try{
                        result.data = JSON.parse(body);
                    } catch(e){
                        result.data = body;
                    }
                    resolve(result);
                });
            });

            req.on("error", (err)=>{
                throw new httpError("RequestError", "Error when requesting data!", err);
            });

            req.on("socket", (socket)=>{
                socket.setTimeout(7000);
                socket.on("timeout", ()=>{
                    throw { "type": "TimeoutError", "msg": "Timeout when sending data", "error": "Timeout" };
                });
            });

            req.end();
        });
    }

    postRequest(options, data){
        return new Promise((resolve)=>{
            var req = http.request(options, (res)=>{
                let result = {};
                result.statusCode = res.statusCode;
                result.headers = res.headers;
                let bodyChunks = [];

                res.on("data", (chunk)=>{
                    bodyChunks.push(chunk);
                });
                res.on("end", ()=>{
                    let body = Buffer.concat(bodyChunks).toString();
                    try{
                        result.data = JSON.parse(body);
                    } catch(e){
                        result.data = body;
                    }
                    resolve(result);
                });
            });

            req.on("error", (err)=>{
                throw { "type": "RequestError", "msg": "Error when requesting data!", "error": err};
            });

            req.on("socket", (socket)=>{
                socket.setTimeout(7000);
                socket.on("timeout", ()=>{
                    throw { "type": "TimeoutError", "msg": "Timeout when sending data", "error": "Timeout" };
                });
            });

            req.write(JSON.stringify(data));
            req.end();
        });
    }
}

module.exports = HttpBase;