"use strict";

var express          = require("express");
var router           = express.Router();
var AdminRouter     = require("./admin");
var DashboardRouter = require("./dashboard");
var ScheduleRouter  = require("./schedule");
var SessionRouter   = require("./session");
var DeviceRouter    = require("./device");

module.exports = function (app) {
    var dash  = Object.create(DashboardRouter).init(app);
    var sched = Object.create(ScheduleRouter).init(app);
    var sesh  = Object.create(SessionRouter).init(app);
    var admin = Object.create(AdminRouter).init(app);
    var device = Object.create(DeviceRouter).init(app);

    // Retrieve the user info
    router.use(sesh.isLoggedIn.bind(sesh));

    // Admin
    router.get("/admin",             admin.displayAdminPage.bind(admin));
    router.post("/admin/save-event", admin.saveEventChanges.bind(admin));
    router.post("/admin/save-user",  admin.saveUserChanges.bind(admin));

    // Event
    router.get("/event/:event_id", sched.displayEvent.bind(sched));

    // Session
    router.get("/",          sesh.displayLogin.bind(sesh));
    router.post("/",         sesh.validateLogin.bind(sesh));
    router.get("/account",   sesh.displayAccountDetails.bind(sesh));
    router.post("/account",  sesh.updateUserTeamName.bind(sesh));
    router.get("/logout",    sesh.endSession.bind(sesh));
    router.get("/password",  sesh.displayChangePassword.bind(sesh));
    router.post("/password", sesh.validateChangePassword.bind(sesh));

    // Device
    router.get("/device", device.displayDevices.bind(device));
    router.post("/device/save-device", device.saveDeviceChanges.bind(device));

    // Schedule
    router.get("/schedule",            sched.displaySchedule.bind(sched));
    router.get("/schedule/week/:week", sched.displaySchedule.bind(sched));
    router.post("/select-team",        sched.selectTeam.bind(sched));
    router.post("/predict-difference", sched.setPointDifference.bind(sched));
    router.post("/save-recap/:week",   sched.saveRecap.bind(sched));
    router.get("/player/:id",          sched.displayPlayerProfile.bind(sched));

    // Scores
    router.get("/scores", dash.displayDashboard.bind(dash));

    // Rules
    router.get("/rules", function (req, res) {
        res.render("rules", {title: app.get("title"), user: req.user, firstUse: false});
    });

    //Terms and Privacy
    router.get("/terms", function (req, res) {
        res.render("terms", {title: app.get("title"), user: req.user, firstUse: false});
    });

    router.get("/privacy", function (req, res) {
        res.render("privacy", {title: app.get("title"), user: req.user, firstUse: false});
    });

    // First-Use
    router.get("/first-use", function (req, res) {
        res.render("rules", {title: app.get("title"), user: req.user, firstUse: true});
    });

    return router;
};

