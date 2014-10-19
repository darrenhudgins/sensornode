"use strict";

var MongoClient = require("mongodb").MongoClient;
var moment      = require("moment");

MongoClient.connect("mongodb://localhost:27017/nflpredictor", function (err, db) {

    if (err) throw new Error(err);

    var schedule = db.collection("schedule");
    var cursor   = schedule.find({});

    cursor.each(function (err, event) {

        if (err) throw new Error(err);

        if (event === null) {
            setTimeout(function () {
                db.close();
            }, 3000);
            return;
        }

        var dt    = moment(event.datetime);
        var newdt = dt.add(4, "hours");

        schedule.update({_id: event._id}, {$set: {datetime: newdt.toDate()}}, {w:0});
    });
});