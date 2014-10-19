"use strict";

var moment      = require("moment");
var ObjectID    = require("mongodb").ObjectID;
var Router      = require("./router");
var DeviceRouter = Object.create(Router);

DeviceRouter.displayDevices = function (req, res, next) {
    console.log("displayDevices");
    //if (!req.user.admin) return res.redirect("/");

        this.devices().getDevices(function (err, devices) {

            if (err) return next(err);

                res.render("device", {
                    title:    this.app.get("title"),
                    devices: devices,
                    user:     req.user
                });
        }.bind(this));

};

DeviceRouter.saveDeviceChanges = function (req, res, next) {
    console.log("saveDeviceChanges");
    var device_id   = ObjectID(req.body.device_id);
    var manufacturer = req.body.manufacturer;
    var model = req.body.model;
    console.log("saveDeviceChanges, model:" + manufacturer);
    var update = {
        $set: {
            //_id: device_id,
            manufacturer: manufacturer,
            model: model
        }
    };

    if (!req.user.admin) {
        return next(new Error("User is not authorized to perform this action."));
    }

    this.devices().updateDevice(device_id, update, function (err, num) {

        if (err || num <= 0) {
            return res.send({success: false});
        }
        res.send({success: true});
    });
};

module.exports = DeviceRouter;
