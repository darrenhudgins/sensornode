var user = ObjectId("53e80d04902489e5382f267d");

db.users.remove({_id: user});
db.sessions.remove({user_id: user});
db.schedule.update({}, {$pullAll: {away_picks: [user]}}, {multi: true});
db.schedule.update({}, {$pullAll: {home_picks: [user]}}, {multi: true});
