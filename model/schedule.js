"use strict";

var moment = require("moment");

var ScheduleDAO = function (db) {

    /*
     * If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly.
     */
    if (false === (this instanceof ScheduleDAO)) {
        console.log('Warning: ScheduleDAO constructor called without "new" operator');
        return new ScheduleDAO(db);
    }

    var schedule = db.collection("schedule");

    this.getEvent = function (event_id, callback) {
        schedule.findOne({_id: event_id}, function (err, event) {
            callback(err, event);
        });
    };

    this.getSchedule = function (week, callback) {
        var query  = week ? {week: week} : {};
        var sort   = {sort: {datetime: 1, _id: 1}};
        var cursor = schedule.find(query, sort);

        cursor.toArray(function (err, data) {

            if (err) return callback(err, null);

            callback(null, data);
        });
    };

    this.getScoreEvents = function (callback) {
        var aggregate = [
            {
                $match: {
                    datetime:   {$lt: new Date()},
                    away_score: {$ne: null},
                    home_score: {$ne: null}
                }
            },
            {
                $project: {
                    _id:              0,
                    away_picks:       1,
                    home_picks:       1,
                    point_difference: 1,

                    // If the score total is less than 0, the away team won
                    score_total: {$subtract: ["$home_score", "$away_score"]}
                }
            }
        ];

        schedule.aggregate(aggregate, callback);
    };

    this.updateEvent = function (event_id, update, callback) {
        schedule.update({_id: event_id}, update, callback);
    };

    this.userSelectedTeamForEvent = function (user_id, team, event_id, callback) {
        var pullfield = (team === "away" ? "home" : "away") + "_picks";
        var pushfield = (team === "away" ? "away" : "home") + "_picks";
        var query     = {_id: event_id};
        var update    = {$addToSet: {}, $pullAll: {}};

        // Add the user to the array for the team they selected
        update.$addToSet[pushfield] = user_id;

        // Remove the user from the array for the opposite team
        update.$pullAll[pullfield]  = [user_id];

        schedule.update(query, update, {w: 1}, function (err, num) {
            callback(err, num);
        });
    };

    this.userSetPointDifference = function (user_id, difference, event_id, callback) {
        var query  = {_id: event_id};
        var update = {$set: {}};

        update.$set["point_difference.user_" +  user_id.toHexString()] = difference;

        schedule.update(query, update, {w: 1}, function (err, num) {
            callback(err, num);
        });
    };
};

module.exports = ScheduleDAO;

