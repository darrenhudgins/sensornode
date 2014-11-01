"use strict";

//var moment = require("moment");

var ObservationsDAO = function (db) {

    /*
     * If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly.
     */
    if (false === (this instanceof ObservationsDAO)) {
        console.log('Warning: ObservationsDAO constructor called without "new" operator');
        return new ObservationsDAO(db);
    }

    var observations = db.collection("observations");

    /*this.getObservation = function (observation_id, callback) {
        observations.findOne({_id: observation_id}, callback);
    };*/

    this.getObservations = function (callback) {
        var query  = {};
        var select = {};
        var sort   = {_id: 1};

        observations.find(query, select).sort(sort).toArray(callback);
    };


    this.updateObservation = function (observation_id, observation, callback) {
        var options = {upsert: true};
        var query   = {_id: observation_id};

        observations.update(query, observation, options, callback);
    };
};

module.exports = ObservationsDAO;

