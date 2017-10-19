"use strict";

const express = require("express");
const events = require("events");

class Routes extends events.EventEmitter {

    constructor(){
        super();
        
        this.router = express.Router();
        this._createRoutes
    }

    _createRoutes(){
        var that = this;

        that.router.route("/ping").get((req, res)=>{
            res.statusCode = 200;
            res.send("pong");
        });

        that.router.route("/changeStatus").post((req, res)=>{
            //Change the status
            res.statusCode = 200;
        });

        that.router.route("/simulateCard").post((req, res)=>{
            var uid = req.body.card;
            //Send card
            this.emit("simucard", uid);
            res.statusCode = 200;
        });

        that.router.route("/beep").post(function (req, res) {
            // that.tmService.buzzer.playSound();
            // res.statusCode = 200;
        });

        that.router.route("/getMissingCards").get((req, res) => {
            // that.db.getUnknownCards().then((data) => {
            //     res.statusCode = 200;
            //     res.send(data);
            // }, (err) => {

            // });
        });

        that.router.route("/getMissingCard/:id").get((req, res) => {
            // if (req.params.id) {
            //     that.db.getUnknownCard(req.params.id).then((data) => {
            //         if (data) {
            //             res.statusCode = 200;
            //             res.send(data);
            //         }
            //     }, (err) => {
            //         res.statusCode = 500;
            //     });
            // } else {
            //     res.statusCode = 404;
            // }
        });

        that.router.route("/loadEmployees").get((req, res) => {
            // that.tmService.getEmployees().then((data) => {
            //     res.statusCode = 200;
            //     res.send(data);
            // }, (err) => {
            //     res.statusCode = 500;
            // });
        });
    }
}

module.exports = Routes;