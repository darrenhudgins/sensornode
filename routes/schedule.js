"use strict";

var marked         = require("marked");
var moment         = require("moment");
var Promise        = require("promise");
var ObjectID       = require("mongodb").ObjectID;
var teams          = require("../model/teams");
var Router         = require("./router");
var ScheduleRouter = Object.create(Router);

ScheduleRouter.calculateScoreForUsers = function (users, events) {
    var scoreChange;
    var rank   = 1;
    var userIndexObj  = {};

    // Create a reference object to store indexes of each team by id
    users.forEach(function (user, i) {
        user.score         = 0;
        user.picks_correct = 0;
        user.picks_wrong   = 0;

        user.toString = function () {
            return this.firstName + " " + this.lastName.charAt(0) + ". (" +
                    this.picks_correct + "-" + this.picks_wrong + ")";
        };

        userIndexObj["user_" + user._id.toHexString()] = i;
    });

    // Iterate over the events and add up the score for each team
    events.forEach(function (event) {
        var pickField;
        var total = event.score_total ? event.score_total : event.home_score - event.away_score;

        if (isNaN(total) || total === 0) return;

        // Use the total to determine which array of picks are correct
        var correctPicksArr = total > 0 ? event["home_picks"] : event["away_picks"];
        var wrongPicksArr   = total > 0 ? event["away_picks"] : event["home_picks"];

        // Iterate over the picks and increment the user's score
        correctPicksArr.forEach(function (user_id) {
            var user;

			if (userIndexObj.hasOwnProperty("user_" + user_id.toHexString())) {
				user = users[userIndexObj["user_" + user_id.toHexString()]];
                user.score++;
                user.picks_correct++;
			}
        });

        // Iterate over the incorrect picks and increment the incorrect score
        wrongPicksArr.forEach(function (user_id) {
            var user;

            if (userIndexObj.hasOwnProperty("user_" + user_id.toHexString())) {
                user = users[userIndexObj["user_" + user_id.toHexString()]];
                user.picks_wrong++;
            }
        });

        // Calculate bonus points for point differences
        users.forEach(function (user) {
            var pointDifference = Math.abs(total);
            var userKey         = "user_" + user._id.toHexString();
            var userDifference  = event.point_difference[userKey] || 0;

            if (pointDifference === userDifference) {
                user.score += 2;
            }
        });
    });

    // Sort the teams by score (descending)
    users.sort(function (a, b) {
        var sort = a.score > b.score ? -1 : (b.score > a.score ? 1 : 0);

        if (sort === 0) {
            sort = a.teamName < b.teamName ? -1 : (b.teamName < a.teamName ? 1 : 0);
        }
        return sort;
    });

    // Iterate over the teams to figure out the player ranking
    users.forEach(function (user) {

        if (user.score !== scoreChange) {
            scoreChange = user.score;
            user.rank   = rank;
        }
        rank++;
    });

    return users;
};

ScheduleRouter.displayEvent = function (req, res, next) {
    var event_id = ObjectID(req.params.event_id);

    this.schedule().getEvent(event_id, function (err, event) {

        if (err) next(err);

        this.users().getUsers(function (err, users) {

            if (err) return next(err);

            // Format the event data
            formatScheduleData([event], req);

            function mapUserToPick(user_id) {

                for (var i = 0, max = users.length; i < max; i++) {

                    if (users[i]._id.equals(user_id)) {
                        var userHex = "user_" + user_id.toHexString();

                        if (event.point_difference.hasOwnProperty(userHex)) {
                            users[i].point_difference = event.point_difference[userHex];
                        }
                        return users[i];
                    }
                }
                return null;
            }

            // If the user is an admin, provide a list of players that haven't picked yet
            if (req.user.admin) {
                var all_picks  = event.home_picks.concat(event.away_picks);
                event.no_picks = [];

                users.forEach(function (user) {

                    if (!user.active) return;

                    for (var i = 0, max = all_picks.length; i < max; i++) {

                        if (user._id.equals(all_picks[i])) {
                            return;
                        }
                    }
                    user.toString = function () {
                        return this.firstName + " " + this.lastName.charAt(0) + ".";
                    };
                    event.no_picks.push(user);
                });
            }

            // Map the picks to user objects
            event.away_picks = event.away_picks.map(mapUserToPick);
            event.home_picks = event.home_picks.map(mapUserToPick);

            res.render("event", {
                title: this.app.get("title"),
                user:  req.user,
                event: event
            });
        }.bind(this));
    }.bind(this));
};

ScheduleRouter.displayPlayerProfile = function (req, res, next) {
    res.render("player", {
        player: req.user,
        title:  this.app.get("title"),
        user:   req.user
    });
};

ScheduleRouter.displaySchedule = function (req, res, next) {
    var week        = this.getWeek(req.params.week);
    var weeks       = this.weeks().getWeeks();
    var prevWeek    = week.index > 0 ? weeks[week.index - 1] : null;
    var nextWeek    = week.index < weeks.length - 1 ? weeks[week.index + 1] : null;
    var getSchedule = Promise.denodeify(this.schedule().getSchedule);
    var getRecaps   = Promise.denodeify(this.recaps().getRecaps);
    var getTeams    = Promise.denodeify(this.users().getTeams);

    Promise.all([
        getSchedule(week._id),
        getTeams(),
        getRecaps(week._id)]
    ).done(function(result) {
        var events  = result[0];
        var players = result[1];
        var recaps  = result[2];

        res.render("schedule", {
            title:       this.app.get("title"),
            user:        req.user,
            schedule:    formatScheduleData(events, req),
            currentWeek: week,
            prevWeek:    prevWeek,
            nextWeek:    nextWeek,
            teams:       this.calculateScoreForUsers(players, events),
            weeks:       weeks,
            recap:       recaps[0],
            recapHtml:   recaps[0] ? marked(recaps[0].recap) : null
        });

    }.bind(this), next);
};

ScheduleRouter.getWeek = function (week_id) {
    var i, max;
    var now   = moment();
    var weeks = this.weeks().getWeeks();

    if (week_id) {

        for (i = 0, max = weeks.length; i < max; i++) {
            if (weeks[i]._id === week_id) return weeks[i];
        }
    }

    for (i = 0, max = weeks.length; i < max; i++) {
        if (weeks[i].current_week) return weeks[i];
    }

    return weeks[0];
};

ScheduleRouter.selectTeam = function (req, res, next) {
    var event_id = ObjectID(req.body.event);
    var team     = req.body.team;
    var user_id  = req.user_id;

    this.schedule().getEvent(event_id, function (err, event) {

        if (err) res.send({success: false});

        var now       = moment();
        var eventTime = moment(event.datetime);

        if (now.isAfter(eventTime)) return res.send({success: false});

        this.schedule().userSelectedTeamForEvent(user_id, team, event_id, function (err, num) {

            if (err || num <= 0) {
                return res.send({success: false});
            }
            res.send({success: true});
        });
    }.bind(this));
};

ScheduleRouter.saveRecap = function(req, res, next) {

   if (!req.user.admin) {
        return next(new Error("User is not authorized to perform this action."));
   }

   var recap  = req.body.recap;
   var active = req.body.active == "true"; //clean this to a boolean
   var week   = req.params.week;

   this.recaps().saveRecap(week, recap, active, function (err, num) {

       if (err || num <= 0) {
           return res.send({success: false});
       }
       res.send({success: true});
   });
}

ScheduleRouter.setPointDifference = function (req, res, next) {
    var difference = parseInt(req.body.difference);
    var event_id   = ObjectID(req.body.event);
    var user_id    = req.user_id;

    if (isNaN(difference)) {
        difference = null;
    }

    this.schedule().getEvent(event_id, function (err, event) {

        if (err) res.send({success: false});

        var now       = moment();
        var eventTime = moment(event.datetime);

        if (now.isAfter(eventTime)) return res.send({success: false});

        this.schedule().userSetPointDifference(user_id, difference, event_id, function (err, num) {

            if (err || num <= 0) {
                return res.send({success: false});
            }
            res.send({success: true});
        });
    }.bind(this));
};

function formatScheduleData(schedule, req) {
    var now     = moment();
    var userHex = req.user_id.toHexString();

    schedule.forEach(function (event) {
        var datetime, i, max, totalPicks;

        datetime              = moment(event.datetime);
        event.date            = datetime.format("ddd, D MMM");
        event.time            = datetime.format("h:mm a");
        event.away_class      = "away " + event.away_team;
        event.home_class      = "home " + event.home_team;
        event.away_team       = teams[event.away_team];
        event.home_team       = teams[event.home_team];
        event.class           = "";
        event.user_difference = null;
        event.real_difference = Math.abs(event.away_score - event.home_score);
        event.event_id        = event._id.toHexString();

        // Winning team
        if (event.away_score > event.home_score) {
            event.away_class += " winner";
        } else if (event.home_score > event.away_score) {
            event.home_class += " winner";
        }

        // Calculate the pick percentages
        totalPicks = event.away_picks.length + event.home_picks.length;
        event.away_decimal = 0;
        event.home_decimal = 0;

        if (totalPicks != 0) {
            event.away_decimal = event.away_picks.length / totalPicks;
            event.home_decimal = event.home_picks.length / totalPicks;
        }

        event.away_percent = Math.round(event.away_decimal * 100) + "%";
        event.home_percent = Math.round(event.home_decimal * 100) + "%";

        // If event happened in past, it should be disabled
        if (datetime.subtract(2, "minutes").isBefore(now)) {
            event.disabled = true;
        }

        // Check to see if user picks the away team
        for (i = 0, max = event.away_picks.length; i < max; i++) {

            if (req.user_id.equals(event.away_picks[i])) {
                event.away_team.selected = true;
                event.away_class += " selected";
                event.class      += "away-selected";
                break;
            }
        }

        // Check to see if user picks the home team
        for (i = 0, max = event.home_picks.length; i < max; i++) {

            if (req.user_id.equals(event.home_picks[i])) {
                event.home_team.selected = true;
                event.home_class += " selected";
                event.class      += "home-selected";
                break;
            }
        }

        // Get the user's point difference setting
        event.user_predicted_class = "";

        if (event.point_difference.hasOwnProperty("user_" + userHex)) {
            event.user_difference = event.point_difference["user_" + userHex];

            if (event.user_difference === event.real_difference) {
                event.user_predicted_class      = "correct-difference";
                event.user_predicted_difference = true;
            } else if (event.real_difference > 0) {
                event.user_predicted_class = "incorrect-difference";
            }
        }
    });

    return schedule;
}

module.exports = ScheduleRouter;
