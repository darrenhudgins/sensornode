(function ($, Modernizr) {
    "use strict";

    var AccountController = {

        addEventListeners: function () {
            $("#editTeamLink").on("click", this.toggleEditTeam.bind(this));
        },

        init: function () {
            this.addEventListeners();
            return this;
        },

        toggleEditTeam: function (e) {
            e.preventDefault();

            var $row = $("#teamNameRow").toggleClass("edit");

            if ($row.hasClass("edit")) {
                $("#teamName").select();
            }
        }
    };

    var AdminController = {

        addEventListeners: function () {
            $(".edit-event-link, .save-event-link").on("click", this.toggleEditEvent.bind(this));
            $(".edit-user-link, .save-user-link").on("click", this.toggleEditUser.bind(this));
        },

        init: function () {
            this.addEventListeners();
            return this;
        },

        saveEvent: function (event_id, $editRow, $viewRow) {
            var away_score = parseInt($editRow.find("input[name=\"away_score\"]").val());
            var home_score = parseInt($editRow.find("input[name=\"home_score\"]").val());
            var data = {
                event_id:   event_id,
                away_score: isNaN(away_score) ? null : away_score,
                home_score: isNaN(home_score) ? null : home_score,
                method:     "updateEvent"
            };

            $viewRow.find("td.away-score").text(data.away_score !== null ? data.away_score : "");
            $viewRow.find("td.home-score").text(data.home_score !== null ? data.home_score : "");

            $.post("/admin/save-event", data, function (res) {
                console.log(res);
            });
        },

        saveUser: function (user_id, $editRow, $viewRow) {
            var password = $editRow.find("input[name=\"password\"]").val();
            var data = {
                user_id:   user_id,
                firstName: $editRow.find("input[name=\"firstName\"]").val(),
                lastName:  $editRow.find("input[name=\"lastName\"]").val(),
                //teamName:  $editRow.find("input[name=\"teamName\"]").val(),
                active:    $editRow.find("input[name=\"active\"]").prop("checked")
            };

            if ($.trim(password).length > 0) {
                data.password = password;
            }

            $.post("/admin/save-user", data, function (res) {

                if (res.success === true) {
                    window.location.reload();
                }
            });
        },

        toggleEditEvent: function (e) {
            var $target  = $(e.target);
            var event_id = $target.data("event");
            var $editRow = $("#eventEdit_" + event_id).toggleClass("hide");
            var $viewRow = $("#eventView_" + event_id).toggleClass("hide");

            e.preventDefault();

            if ($target.is(".save-event-link")) {
                this.saveEvent(event_id, $editRow, $viewRow);
            }
        },

        toggleEditUser: function (e) {
            var $target  = $(e.target);
            var user_id  = $target.data("user");
            var $editRow = $("#userEdit_" + user_id).toggleClass("hide");
            var $viewRow = $("#userView_" + user_id).toggleClass("hide");

            e.preventDefault();

            if ($target.is(".save-user-link")) {
                this.saveUser(user_id, $editRow, $viewRow);
            }
        }
    };

    var DeviceController = {

        addEventListeners: function () {
            $(".edit-device-link, .save-device-link").on("click", this.toggleEditDevice.bind(this));
        },

        init: function () {
            this.addEventListeners();
            return this;
        },

        saveDevice: function (device_id, $editRow, $viewRow) {

            var data = {
                device_id: device_id,
                manufacturer: $editRow.find("input[name=\"manufacturer\"]").val(),
                model:  $editRow.find("input[name=\"model\"]").val(),
                lotNumber: $editRow.find("input[name=\"lotNumber\"]").val()
            };

            //console.log(data.model);
            //console.log(data.manufacturer);
            //console.log(data.lotNumber);

            $.post("/device/save-device", data, function (res) {

                if (res.success === true) {
                    window.location.reload();
                }
            });
        },

        toggleEditDevice: function (e) {
            var $target  = $(e.target);
            var device_id  = $target.data("device");
            var $editRow = $("#deviceEdit_" + device_id).toggleClass("hide");
            var $viewRow = $("#deviceView_" + device_id).toggleClass("hide");

            //e.preventDefault();

            if ($target.is(".save-device-link")) {
                this.saveDevice(device_id, $editRow, $viewRow);
            }
        }
    };

    var ObservationController = {

        addEventListeners: function () {
            $(".edit-observation-link, .save-observation-link").on("click", this.toggleEditObservation.bind(this));
        },

        init: function () {
            this.addEventListeners();
            return this;
        },

        saveObservation: function (observation_id, $editRow, $viewRow) {

            var data = {
                observation_id: observation_id,
                status: $editRow.find("input[name=\"status\"]").val(),
                reliability:  $editRow.find("input[name=\"reliability\"]").val()
            };

            $.post("/observation/save-observation", data, function (res) {

                if (res.success === true) {
                    window.location.reload();
                }
            });
        },

        toggleEditObservation: function (e) {
            var $target  = $(e.target);
            var observation_id  = $target.data("observation");
            var $editRow = $("#observationEdit_" + observation_id).toggleClass("hide");
            var $viewRow = $("#observationView_" + observation_id).toggleClass("hide");

            //e.preventDefault();

            if ($target.is(".save-observation-link")) {
                this.saveObservation(observation_id, $editRow, $viewRow);
            }
        }
    };

    var ScheduleController = {

        addEventListeners: function () {
            var self = this;

            $(".schedule-list-item a.team").on("click", function (e) {
                self.selectTeam(e, this);
            });

            $("#weekSelect").on("change", function (e) {
                window.location.href = $(this).val();
            });

            $(".schedule-list-item .point-difference-input").on("change", function (e) {
                self.setPointDifference(e, this);
            });

            $("#cancelEditRecap, #editRecap").on("click", function (e) {
                e.preventDefault();
                self.toggleEditRecap(e, this);
            });

            $("#saveRecap").on("click", function (e) {
                e.preventDefault();
                self.saveRecap(e, this);
            });
        },

        init: function () {
            this.addEventListeners();
            return this;
        },

        saveRecap: function (e, context) {
            var week   = $("#recapWeek").val();
            var recap  = $("textarea[name='recap']").val();
            var active = $("input[name='recapActive']").prop("checked");
            var data   = {recap: recap, active: active};

            $.post("/save-recap/" + week, data, function (response) {

                if (response.success != true) {
                    alert("An error occurred while attempting to save the " +
                            "recap, please try again.");
                } else {
                    window.location.reload();
                }
            });
        },

        selectTeam: function (e, context) {
            e.preventDefault();

            var $el    = $(context);
            var $par   = $el.parent();
            var team   = $el.data("team");
            var event  = $el.data("event");
            var data   = {team: team, event: event};
            var oclass = $par.attr("class");

            // Mark the team as selected
            $par.removeClass("away-selected home-selected");

            if ($el.hasClass("away")) $par.addClass("away-selected");
            if ($el.hasClass("home")) $par.addClass("home-selected");

            // If on a desktop, selecting a team should focus cursor in input
            if (!Modernizr.touch) {
                $par.find(".point-difference-input").select();
            }

            // Post to the web service
            $.post("/select-team", data, function (response) {

                // If the update failed, reset the selection and alert the user
                if (response.success != true) {
                    alert("An error occurred while attempting to save your " +
                            "changes, please try again.");
                    $par.attr("class", oclass);
                }
            });
        },

        setPointDifference: function (e, context) {
            var $input = $(context);
            var event  = $input.data("event");
            var data   = {event: event, difference: parseInt($input.val())};
            var ogval  = $input.data("value");

            if (isNaN(data.difference)) {
                data.difference = null;
            }

            $.post("/predict-difference", data, function (response) {

                // If the update failed, reset the value and alert the user
                if (response.success != true) {
                    $input.val(ogval);
                    alert("An error occurred while attempting to save your " +
                            "changes, please try again.");
                } else {
                    $input.data("value", data.difference);
                }
            });
        },

        toggleEditRecap: function (e, context) {
            $(".weekly-recap-edit, .weekly-recap-content").toggleClass("hide");
        }
    };

    // Document ready
    $(function () {
        var accountController;
        var adminController;
        var placeholderShim;
        var scheduleController;
        var deviceController;
        var observationController;

        if (!Modernizr.input.placeholder &&
                $(".section-login, .section-change-password").length) {
            $("label").show();
        }

        if ($(".section-schedule").length) {
            scheduleController = Object.create(ScheduleController).init();
        }

        if ($(".section-account-details").length) {
            accountController = Object.create(AccountController).init();
        }

        if ($(".section-admin").length) {
            adminController = Object.create(AdminController).init();
        }

        if ($(".section-device").length) {
            deviceController = Object.create(DeviceController).init();
        }

        if ($(".section-observation").length) {
            observationController = Object.create(ObservationController).init();
        }

    });
}(jQuery, Modernizr));

// Google analytics
/*(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new
    Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-53865013-1', 'auto');
ga('send', 'pageview');*/

