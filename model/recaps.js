"use strict";

var moment = require("moment");

var RecapsDAO = function (db) {

    /*
     * If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly.
     */
    if (false === (this instanceof RecapsDAO)) {
        console.log('Warning: RecapsDAO constructor called without "new" operator');
        return new RecapsDAO(db);
    }

    var recaps = db.collection("recaps");

    this.getEvent = function (event_id, callback) {
        recaps.findOne({_id: event_id}, callback);
    };

    this.getRecaps = function (week, callback) {
        var query = week ? {week: week} : {};
        recaps.find(query).toArray(callback);
    };

    this.saveRecap = function (week, recap, active, callback) {
        var options = {upsert: true};
        var query   = {week: week};
        var update  = {$set: {recap: recap, active: active}};
        recaps.update(query, update, options, callback);
    };
};

module.exports = RecapsDAO;

