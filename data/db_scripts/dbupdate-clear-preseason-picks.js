
// Resets predictions for all preseason games
db.schedule.update(
    {
        week: {$in: ["p1", "p2", "p3", "p4"]}
    },
    {
        $set: {
            away_picks: [],
            home_picks: [],
            point_difference: {}
        }
    },
    {multi: true}
);
