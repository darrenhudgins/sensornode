"use strict";

var bcrypt = require('bcrypt-nodejs');

function UsersDAO(db) {

    /*
     * If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly.
     */
    if (false === (this instanceof UsersDAO)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersDAO(db);
    }

    var users = db.collection("users");

    this.addUser = function(firstName, lastName, teamName, email, password, confirmPassword, callback) {

        // Validate the password and confirm password match
        if (password !== confirmPassword) {
            var password_match_error = new Error("Passwords don't match");
            password_match_error.passwords_dont_match = true;
            return callback(password_match_error, null);
        }

        // Required fields
        if (!firstName.length || !lastName.length || !teamName.length || !email.length || !password.length) {
            var required_fields_error = new Error("Missing required fields");
            required_fields_error.required_fields_missing = true;
            return callback(required_fields_error, null);
        }

        // Make sure the email looks like a valid email (crude email validation)
        if (!/.+@.+\..+/.test(email)) {
            var invalid_email_error = new Error("Invalid email");
            invalid_email_error.invalid_email = true;
            return callback(invalid_email_error, null);
        }

        // Generate password hash
        var salt          = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password/*, salt*/);

        // Create user document
        var user = {
            firstName: firstName,
            lastName:  lastName,
            teamName:  teamName,
            email:     email,
            password:  password_hash,
            active:    false,
            admin:     false
        };

        users.findOne({email: email}, function (err, result) {

            if (err) return callback(err, null);

            // If a result exists, a user with the given email is already registered
            if (result) {
                var user_exists_error = new Error("User already exists");
                user_exists_error.user_already_exists = true;
                return callback(user_exists_error);
            }

            users.insert(user, function (err, result) {

                if (!err) {
                    console.log("Inserted new user");
                    return callback(null, result[0]);
                }

                callback(err, null);
            });
        });

    };

    this.getTeams = function (callback) {
        users.find({active: true}, {firstName: 1, lastName: 1, teamName: 1}).toArray(callback);
    };

    this.getUser = function (user_id, callback) {
        users.findOne({_id: user_id}, callback);
    };

    this.getUsers = function (callback) {
        var query  = {};
        var select = {password: 0};
        var sort   = {lastName: 1, firstName: 1};

        users.find(query, select).sort(sort).toArray(callback);
    };

    this.updatePassword = function (user_id, password, newPassword, confirmPassword, callback) {

        // Required fields
        if (!password || !newPassword || !confirmPassword) {
            var required_fields_error = new Error("Missing required fields");
            required_fields_error.required_fields_missing = true;
            callback(required_fields_error);
        }

        // Validate the password and confirm password match
        if (newPassword !== confirmPassword) {
            var password_match_error = new Error("Passwords don't match");
            password_match_error.passwords_dont_match = true;
            return callback(password_match_error);
        }

        this.getUser(user_id, function (err, theUser) {

            if (err) return callback(err, null);

            this.validateLogin(theUser.email, password, function (err, user) {

                if (err) return callback(err, null);

                // Generate password hash
                var salt          = bcrypt.genSaltSync();
                var password_hash = bcrypt.hashSync(newPassword/*, salt*/);

                users.update({_id: user._id}, {$set: {password: password_hash}}, function (err, result) {

                    if (!err) {
                        console.log("Updated user password");
                        return callback(null, result);
                    }

                    callback(err, null);
                });
            });
        }.bind(this));
    };

    this.updateUser = function (user_id, update, callback) {

        // If updating the password, encrypt it
        if (update.$set.hasOwnProperty("password")) {
            var salt             = bcrypt.genSaltSync();
            update.$set.password = bcrypt.hashSync(update.$set.password/*, salt*/);
        }
        users.update({_id: user_id}, update, callback);
    };

    this.validateLogin = function (email, password, callback) {

        users.findOne({email: email}, function (err, user) {

            if (err) return callback(err, null);

            if (user) {

                if (bcrypt.compareSync(password, user.password)) {
                    callback(null, user);
                } else {
                    var invalid_password_error = new Error("Invalid password");
                    invalid_password_error.invalid_password = true;
                    callback(invalid_password_error, null);
                }
            } else {
                var no_such_user_error = new Error("User: " + user + " does not exist");
                no_such_user_error.no_such_user = true;
                callback(no_such_user_error, null);
            }
        });
    };
}

module.exports = UsersDAO;
