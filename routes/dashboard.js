"use strict";

var ScheduleRouter  = require("./schedule");
var Router          = require("./router");
var DashboardRouter = Object.create(Router);

DashboardRouter.displayDashboard = function (req, res, next) {

    // Get the scores object
    this.schedule().getScoreEvents(function (err, events) {

        if (err) return next(err);

        // Get the teams
        this.users().getTeams(function (err, teams) {

            if (err) return next(err);

            // Render the page
            res.render("dashboard", {
                title: this.app.get("title"),
                user:  req.user,
                teams: this.scheduleObj.calculateScoreForUsers(teams, events)
            });
        }.bind(this));
    }.bind(this));
};

DashboardRouter.init = function (app) {
    Router.init.call(this, app);
    this.scheduleObj = Object.create(ScheduleRouter);
    return this;
};

module.exports = DashboardRouter;
