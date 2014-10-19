var now   = new Date();
var sDate = new Date(now.getTime() - 86400000 * 2);

db.sessions.remove({datetime: {$lt: sDate} });
