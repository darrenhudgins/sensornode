"use strict";

var Router        = require("./router");
var SessionRouter = Object.create(Router);

SessionRouter.addUser = function (req, res, next) {
    var firstName       = req.body.caFirstName.replace(/[^A-Z\- ]+/gi, "").trim();
    var lastName        = req.body.caLastName.replace(/[^A-Z\- ]+/gi, "").trim();
    var teamName        = this.generateRandomTeamName(firstName);
    var email           = req.body.caEmail.toLowerCase().trim();
    var password        = req.body.caPassword;
    var confirmPassword = req.body.caConfirmPassword;

    console.log("User attempting to create new account: ", firstName, lastName, email, password, confirmPassword);

    this.users().addUser(firstName, lastName, teamName, email, password, confirmPassword, function (err, user) {
        var ca_error;

        if (err) {

            if (err.user_already_exists) {
                ca_error = "User already exists";
            } else if (err.passwords_dont_match) {
                ca_error = "Password's don't match";
            } else if (err.required_fields_missing) {
                ca_error = "Missing required fields";
            } else if (err.invalid_email) {
                ca_error = "Invalid email";
            }

            if (ca_error) {
                return res.render("index", {
                    title: this.app.get("title"),
                    ca_error: ca_error,
                    caFirstName: firstName,
                    caLastName: lastName,
                    caTeamName: teamName,
                    caEmail: email
                });
            } else {
                return next(err);
            }
        }

        this.sessions().startSession(user._id, function (err, session_id) {

            if (err) return next(err);

            res.cookie('session', session_id);
            return res.redirect('/first-use');
        }.bind(this));
    }.bind(this));
};

SessionRouter.displayAccountDetails = function (req, res) {

    res.render("account", {
        title: this.app.get("title"),
        user:  req.user
    });
};

SessionRouter.displayChangePassword = function (req, res, next) {
    res.render("password", {
        title: this.app.get("title"),
        user:  req.user
    });
};

SessionRouter.displayLogin = function (req, res) {
    res.render("index", {title: this.app.get("title")});
};

SessionRouter.endSession = function (req, res, next) {
    var session_id = req.cookies.session;

    this.sessions().endSession(session_id, function (err) {

        if (err) {
            return next(err);
        }
        res.clearCookie("session");
        res.redirect("/");
    }.bind(this));
};

SessionRouter.generateRandomTeamName = function (firstName) {
    var adjs  = ["Awesome", "Fabulous", "Amazing", "Spectacular",
            "Wonderful", "Inspiring", "Killer", "Lucky", "Incredible",
            "Marvelous", "Unbelievable", "Remarkable", "Impressive",
            "Majestic", "Magical", "Rad", "Great", "Epic", "Gnarly",
            "Wicked Tight"];
    var nouns = ["Picks", "Bracket", "Predictions", "Selections", "Choices",
            "Decisions"];
    var randAdjIndex  = Math.floor(Math.random() * adjs.length);
    var randNounIndex = Math.floor(Math.random() * nouns.length);

    return firstName + "'s " + adjs[randAdjIndex] + " " + nouns[randNounIndex];
};

/**
 * Middleware that checks if a user is logged in.
 */
SessionRouter.isLoggedIn = function (req, res, next) {
    var session_id = req.cookies.session;

    this.sessions().getUserID(session_id, function (err, user_id) {

        if (!err && user_id) {
            req.user_id = user_id;
        }

        // If the user is logged in, redirect to dashboard if on login page
        if (req.url == "/" && req.user_id) {
            return res.redirect("/schedule");

            // Otherwise, if user is not logged in, redirect to login page
        } else if (!req.user_id && req.url != "/") {
            return res.redirect("/");
        }

        this.users().getUser(req.user_id, function (err, user) {

            if (user) {
                req.user = user;
            }

            next(err);
        }.bind(this));
    }.bind(this));
};

SessionRouter.updateUserTeamName = function (req, res, next) {
    var user_id = req.user_id;
    var update  = {
        $set: {
            teamName: req.body.teamName.replace(/[^A-Z0-9 -_\.'"\(\)]/gi, "").trim()
        }
    };

    if (!update.$set.teamName.length) {
        return res.redirect("/account");
    }

    this.users().updateUser(user_id, update, function (err) {

        if (err) return next(err);

        res.redirect("/account");
    });
};

SessionRouter.validateChangePassword = function (req, res, next) {
    var user_id            = req.user_id;
    var password           = req.body.password;
    var newPassword        = req.body.newPassword;
    var confirmNewPassword = req.body.confirmNewPassword;

    this.users().updatePassword(user_id, password, newPassword, confirmNewPassword, function (err) {
        var password_error;

        if (err) {

            if (err.required_fields_missing) {
                password_error = "Missing required fields";
            } else if (err.passwords_dont_match) {
                password_error = "Passwords don't match";
            } else if (err.invalid_password) {
                password_error = "Invalid password";
            } else {
                return next(err);
            }

            return res.render("password", {
                title: this.app.get("title"),
                user:  req.user,
                password_error: password_error
            });
        }

        res.render("password", {
            title: this.app.get("title"),
            user:  req.user,
            password_success: "Password changed successfully"
        });
    }.bind(this));
};

SessionRouter.validateLogin = function (req, res, next) {

    if (req.body.newAccount && req.body.newAccount == "1") {
        return this.addUser(req, res, next);
    }

    var email    = req.body.email.toLowerCase();
    var password = req.body.password;

    console.log("user submitted email: " + email + " pass: " + password);

    this.users().validateLogin(email, password, function (err, user) {
        var login_error;

        if (err) {

            if (err.no_such_user) {
                login_error = "No such user";
            } else if (err.invalid_password) {
                login_error = "Invalid password";
            }

            if (login_error) {
                return res.render("index", {
                    title:       this.app.get("title"),
                    email:       email,
                    login_error: login_error
                });
            } else {
                return next(err);
            }
        }

        this.sessions().startSession(user._id, function (err, session_id) {

            if (err) return next(err);

            // Set a session cookie that expires in 2 weeks
            var now        = new Date();
            var expireDate = new Date(now.getTime() + 86400000 * 14);

            res.cookie("session", session_id, {expires: expireDate});

            return res.redirect("/schedule");
        }.bind(this));
    }.bind(this));
};

module.exports = SessionRouter;
