"use strict";

var moment      = require("moment");
var ObjectID    = require("mongodb").ObjectID;
var teams       = require("../model/teams");
var Router      = require("./router");
var AdminRouter = Object.create(Router);

AdminRouter.displayAdminPage = function (req, res, next) {

    if (!req.user.admin) return res.redirect("/");

    this.schedule().getSchedule(null, function (err, schedule) {

        if (err) return next(err);

        this.users().getUsers(function (err, users) {

            if (err) return next(err);

            this.devices().getDevices(function (err, devices) {

                if (err) return next(err);

                res.render("admin", {
                    title:    this.app.get("title"),
                    schedule: formatSchedule.call(this, schedule),
                    users:    users,
                    devices: devices,
                    user:     req.user
                });
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

AdminRouter.saveEventChanges = function (req, res, next) {
    var event_id   = ObjectID(req.body.event_id);
    var away_score = parseInt(req.body.away_score);
    var home_score = parseInt(req.body.home_score);
    var update = {
        $set: {
            away_score: isNaN(away_score) ? null : away_score,
            home_score: isNaN(home_score) ? null : home_score
        }
    };

    if (!req.user.admin) {
        return next(new Error("User is not authorized to perform this action."));
    }

    this.schedule().updateEvent(event_id, update, function (err, num) {

        if (err || num <= 0) {
            return res.send({success: false});
        }
        res.send({success: true});
    });
};

AdminRouter.saveUserChanges = function (req, res, next) {
    var user_id   = ObjectID(req.body.user_id);
    var firstName = req.body.firstName.replace(/[^A-Z\- ]+/gi, "") || "";
    var lastName  = req.body.lastName.replace(/[^A-Z\- ]+/gi, "") || "";
    //var teamName  = req.body.teamName.replace(/[^A-Z0-9\-_ \.'"\(\)]/gi, "") || "";
    var password  = req.body.password || null;
    var update    = {
        $set: {
            firstName: firstName.trim(),
            lastName:  lastName.trim(),
            //teamName:  teamName.trim(),
            active:    req.body.active == "true"
        }
    };

    if (password) {
        update.$set.password = password;
    }

    if (!req.user.admin) {
        return next(new Error("User is not authorized to perform this action."));
    }

    // Validate the required fields
    if (!firstName.length || !lastName.length) {
        return res.send({success: false, message: "Missing required fields."});
    }

    this.users().updateUser(user_id, update, function (err, num) {

        if (err || num <= 0) {
            return res.send({success: false});
        }
        res.send({success: true});
    });
};

function formatSchedule(events) {
    var weeks = this.weeks().getWeeksObj();

    events.forEach(function (event) {
        event.date = moment(event.datetime).format("ddd, DD MMM");
        event.time = moment(event.datetime).format("HH:mm");
        event.away_team = teams[event.away_team];
        event.home_team = teams[event.home_team];
        event.week = weeks[event.week];
    });
    return events;
}

module.exports = AdminRouter;
