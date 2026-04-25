"use strict";

module.exports = {
    config: {
        name: "inactiveKick",
        interval: 60 * 60 * 1000, // every 1 hour check
        enabled: true
    },

    async execute({ api, db, config }) {
        if (!db) return;

        const limit = 3 * 24 * 60 * 60 * 1000; // 3 DAYS

        const now = Date.now();

        const users = await db.collection("activity").find().toArray();

        for (const user of users) {
            if (!user.lastActive) continue;

            const diff = now - user.lastActive;

            if (diff >= limit) {
                try {
                    await api.gcmember("remove", user.userID, user.threadID);

                    await db.collection("activity").deleteOne({
                        userID: user.userID,
                        threadID: user.threadID
                    });

                    console.log(`Kicked inactive user: ${user.userID}`);
                } catch (err) {
                    console.log("Kick error:", err.message);
                }
            }
        }
    }
};
