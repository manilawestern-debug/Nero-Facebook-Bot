"use strict";

module.exports.config = {
    name: "inactiveKick",
    interval: 60 * 60 * 1000
};

module.exports.execute = async function ({ api, db }) {
    try {
        if (!db) return;

        const now = Date.now();
        const limit = 3 * 24 * 60 * 60 * 1000;

        const users = await db.collection("activity").find({}).toArray();

        for (const user of users) {
            if (now - user.lastActive > limit) {
                try {
                    await api.gcmember("remove", user.userID, user.threadID);

                    await db.collection("activity").deleteOne({
                        userID: user.userID,
                        threadID: user.threadID
                    });

                } catch (err) {
                    console.log(err.message);
                }
            }
        }

    } catch (err) {
        console.error(err);
    }
};
