"use strict";

var moment      = require("moment");
var ObjectID    = require("mongodb").ObjectID;
var Router      = require("./router");
var ObservationRouter = Object.create(Router);

ObservationRouter.displayObservations = function (req, res, next) {

    //if (!req.user.admin) return res.redirect("/");

        this.observations().getObservations(function (err, observations) {

            if (err) return next(err);

                res.render("observation", {
                    title: this.app.get("title"),
                    observations: observations,
                    user: req.user
                });
        }.bind(this));

};

ObservationRouter.saveObservationChanges = function (req, res, next) {

    var observation_id   = ObjectID(req.body.observation_id);
    var status = req.body.status;
    var reliability = req.body.reliability;
    var update = {
        $set: {
            status: status,
            reliability: reliability
        }
    };

    //if (!req.user.admin) {
    //    return next(new Error("User is not authorized to perform this action."));
    //}

    this.observations().updateObservation(observation_id, update, function (err, num) {

        if (err || num <= 0) {
            return res.send({success: false});
        }
        res.send({success: true});
    });
};

module.exports = ObservationRouter;
