"use strict";

var moment = require("moment");

var WeeksDAO = function (db) {

    this.weeks = [
        {
            "_id": "p1",
            "name":         "Preseason Week 1",
            "start_date":   new Date(2014,7,5,9,0,0,0),
            "end_date":     new Date(2014,7,12,8,59,59,59)
        },
        {
            "_id": "p2",
            "name":         "Preseason Week 2",
            "start_date":   new Date(2014,7,12,9,0,0,0),
            "end_date":     new Date(2014,7,19,8,59,59,59)
        },
        {
            "_id": "p3",
            "name":         "Preseason Week 3",
            "start_date":   new Date(2014,7,19,9,0,0,0),
            "end_date":     new Date(2014,7,26,8,59,59,59)
        },
        {
            "_id":          "p4",
            "name":         "Preseason Week 4",
            "start_date":   new Date(2014,7,26,9,0,0,0),
            "end_date":     new Date(2014,7,29,8,59,59,59)
        },
        {
            "_id":          "r1",
            "current_week": false,
            "name":         "Week 1",
            "start_date":   new Date(2014,7,29,9,0,0,0),
            "end_date":     new Date(2014,8,9,8,59,59,59)
        },
        {
            "_id":          "r2",
            "current_week": false,
            "name":         "Week 2",
            "start_date":   new Date(2014,8,9,9,0,0,0),
            "end_date":     new Date(2014,8,16,8,59,59,59)
        },
        {
            "_id":          "r3",
            "current_week": false,
            "name":         "Week 3",
            "start_date":   new Date(2014,8,16,9,0,0,0),
            "end_date":     new Date(2014,8,23,8,59,59,59)
        },
        {
            "_id":          "r4",
            "current_week": false,
            "name":         "Week 4",
            "start_date":   new Date(2014,8,23,9,0,0,0),
            "end_date":     new Date(2014,8,30,8,59,59,59)
        },
        {
            "_id":          "r5",
            "current_week": false,
            "name":         "Week 5",
            "start_date":   new Date(2014,8,30,9,0,0,0),
            "end_date":     new Date(2014,9,7,8,59,59,59)
        },
        {
            "_id":          "r6",
            "current_week": false,
            "name":         "Week 6",
            "start_date":   new Date(2014,9,7,9,0,0,0),
            "end_date":     new Date(2014,9,14,8,59,59,59)
        },
        {
            "_id":          "r7",
            "current_week": false,
            "name":         "Week 7",
            "start_date":   new Date(2014,9,14,9,0,0,0),
            "end_date":     new Date(2014,9,21,8,59,59,59)
        },
        {
            "_id":          "r8",
            "current_week": false,
            "name":         "Week 8",
            "start_date":   new Date(2014,9,21,9,0,0,0),
            "end_date":     new Date(2014,9,28,8,59,59,59)
        },
        {
            "_id":          "r9",
            "current_week": false,
            "name":         "Week 9",
            "start_date":   new Date(2014,9,28,9,0,0,0),
            "end_date":     new Date(2014,10,4,8,59,59,59)
        },
        {
            "_id":          "r10",
            "current_week": false,
            "name":         "Week 10",
            "start_date":   new Date(2014,10,4,9,0,0,0),
            "end_date":     new Date(2014,10,11,8,59,59,59)
        },
        {
            "_id":          "r11",
            "current_week": false,
            "name":         "Week 11",
            "start_date":   new Date(2014,10,11,9,0,0,0),
            "end_date":     new Date(2014,10,18,8,59,59,59)
        },
        {
            "_id":          "r12",
            "current_week": false,
            "name":         "Week 12",
            "start_date":   new Date(2014,10,18,9,0,0,0),
            "end_date":     new Date(2014,10,25,8,59,59,59)
        },
        {
            "_id":          "r13",
            "current_week": false,
            "name":         "Week 13",
            "start_date":   new Date(2014,10,25,9,0,0,0),
            "end_date":     new Date(2014,11,2,8,59,59,59)
        },
        {
            "_id":          "r14",
            "current_week": false,
            "name":         "Week 14",
            "start_date":   new Date(2014,11,2,9,0,0,0),
            "end_date":     new Date(2014,11,9,8,59,59,59)
        },
        {
            "_id":          "r15",
            "current_week": false,
            "name":         "Week 15",
            "start_date":   new Date(2014,11,9,9,0,0,0),
            "end_date":     new Date(2014,11,16,8,59,59,59)
        },
        {
            "_id":          "r16",
            "current_week": false,
            "name":         "Week 16",
            "start_date":   new Date(2014,11,16,9,0,0,0),
            "end_date":     new Date(2014,11,23,8,59,59,59)
        },
        {
            "_id":          "r17",
            "current_week": false,
            "name":         "Week 17",
            "start_date":   new Date(2014,11,23,9,0,0,0),
            "end_date":     new Date(2014,11,30,8,59,59,59)
        },
        {
            "_id":          "r18",
            "current_week": false,
            "name":         "Week 18",
            "start_date":   new Date(2014,11,30,9,0,0,0),
            "end_date":     new Date(2015,0,6,8,59,59,59)
        }
    ];

    this.calculateCurrentWeek = function () {
        var week;
        var now = moment();

        for (var i = 0, max = this.weeks.length; i < max; i++) {
            week = this.weeks[i];
            week.index = i;

            if (now.isAfter(week.start_date) && now.isBefore(week.end_date)) {
                week.current_week = true;
            } else {
                week.current_week = false;
            }
        }
    };

    this.getWeeks = function () {
        this.calculateCurrentWeek();
        return this.weeks;
    };

    this.getWeeksObj = function () {
        var weeksObj = {};

        this.calculateCurrentWeek();

        this.weeks.forEach(function (week) {
            weeksObj[week._id] = week;
        });
        return weeksObj;
    };
};

module.exports = WeeksDAO;

