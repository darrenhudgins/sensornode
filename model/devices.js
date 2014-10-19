"use strict";

//var moment = require("moment");

var DevicesDAO = function (db) {

    /*
     * If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly.
     */
    if (false === (this instanceof DevicesDAO)) {
        console.log('Warning: DevicesDAO constructor called without "new" operator');
        return new DevicesDAO(db);
    }

    var devices = db.collection("devices");

    /*this.getDevice = function (device_id, callback) {
        devices.findOne({_id: device_id}, callback);
    };*/

    this.getDevices = function (callback) {
        var query  = {};
        var select = {};
        var sort   = {_id: 1};

        devices.find(query, select).sort(sort).toArray(callback);
    };


    this.updateDevice = function (device_id, device, callback) {
        var options = {upsert: true};
        var query   = {_id: device_id};

        devices.update(query, device, options, callback);
    };
};

module.exports = DevicesDAO;

