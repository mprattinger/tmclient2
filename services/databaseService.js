"use strict";

const winston = require("winston");
const events = require("events");
const path = require("path");
const nedb = require("nedb");

class DatabaseService {

    constructor(){
        this._dbPath = path.join(global.rootDir, "data", "tmclient.db");
    }

    init(){
        var that = this;

        winston.info("Initializing DatabaseService....");

        return new Promise((resolve)=>{
            that.db = new nedb({
                "filename": that._dbPath,
                "autoload": true
            });
            resolve();
        });
    }

    storeUnknownTag(uuid){
        var that = this;

        winston.info("Storing unknown tag with id " + cardId);
        var doc = {
            "uuid": uuid,
            "lastTry": new Date()
        }

        return new Promise((resolve)=>{
            winston.info("Checking if unknown tag already in the store...");
            that.db.findOne({"uuid": uuid}, (err, res)=>{
                if(err) throw err;

                if(res==null){
                    winston.info("Tag " + uuid + " not found in the store! Saving data...");
                    that.db.insert(doc, (err, newDoc)=>{
                        if(err) throw new Error("Error saving tag " + uuid + " in the store!" + err.message);
                        resolve(newDoc);
                    });
                } else {
                    winston.info("Tag " + uuid + " found in store. No need to store the card!");
                    resolve();
                }
            });
        });    
    }

    getUnknownCards(){
        var that = this;
        winston.info("Load all unknown tags from database store!");
        return new Promise((resolve)=>{
            that.db.find({}, (err, res)=>{
                if(err) throw err;
                winston.info("Found " + res.length + " tags in database!");
                resolve(res);
            });
        });
    }

    getUnknowCard(uuid){
        var that = this;
        winston.info("Load tag with tagId " + uuid + " from database store!");
        return new Promise((resolve)=>{
            that.db.find({"uuid": uuid}, (err, res)=>{
                if(err) throw err;
                winston.info("Found tag " + res + " in database");
                resolve(res);
            });
        });
    }
}

module.exports = DatabaseService;