"use strict";

var ScheduleDAO = require("../model/schedule");
var SessionsDAO = require("../model/sessions");
var UsersDAO    = require("../model/users");
var DevicesDAO    = require("../model/devices");
var WeeksDAO    = require("../model/weeks");
var RecapsDAO   = require("../model/recaps");

var Router = {

    init: function (app) {
        this.app         = app;
        this.scheduleDAO = null;
        this.sessionsDAO = null;
        this.usersDAO    = null;
        this.devicesDAO    = null;
        this.weeksDAO    = null;
        return this;
    },

    /**
     * Recaps object.
     */
    recaps: function () {

        if (!this.recapsDAO) {
            this.recapsDAO = new RecapsDAO(this.app.get("db"));
        }
        return this.recapsDAO;
    },

    /**
     * Schedule object.
     */
    schedule: function () {

        if (!this.scheduleDAO) {
            this.scheduleDAO = new ScheduleDAO(this.app.get("db"));
        }
        return this.scheduleDAO;
    },

    /**
     * Sessions object.
     */
    sessions: function () {

        if (!this.sessionsDAO) {
            this.sessionsDAO = new SessionsDAO(this.app.get("db"));
        }
        return this.sessionsDAO;
    },

    /**
     * Users object.
     */
    users: function () {

        if (!this.usersDAO) {
            this.usersDAO = new UsersDAO(this.app.get("db"));
        }
        return this.usersDAO;
    },

    /**
     * Devices object.
     */
    devices: function () {

        if (!this.devicesDAO) {
            this.devicesDAO = new DevicesDAO(this.app.get("db"));
        }
        return this.devicesDAO;
    },

    /**
     * Weeks object.
     */
    weeks: function () {

        if (!this.weeksDAO) {
            this.weeksDAO = new WeeksDAO(this.app.get("db"));
        }
        return this.weeksDAO;
    }
};

module.exports = Router;

