"use strict";

module.exports = {
    config: {
        name: "inactiveKick",
        interval: 30 * 1000, // check every 30 seconds (mas mabilis test)
        enabled: true
    },

    async execute({ api, db, config }) {
        if (!api || !db) return;

        const LIMIT = 60 * 1000; // 🔥 1 MINUTE
        const now = Date.now();

        const admins = config.bot.admins || [];
        const superAdmins = config.bot.superAdmins || [];

        try {
            const users = await db.collection("activity").find().toArray();

            for (const user of users) {
                if (!user.lastActive) continue;

                const diff = now - user.lastActive;

                // skip admins
                if (admins.includes(user.userID) || superAdmins.includes(user.userID)) {
                    continue;
                }

                if (diff >= LIMIT) {
                    try {
                        await api.gcmember("remove", user.userID, user.threadID);

                        await db.collection("activity").deleteOne({
                            userID: user.userID,
                            threadID: user.threadID
                        });

                        console.log("🔥 Kicked (1 min inactive):", user.userID);
                    } catch (err) {
                        console.log("Kick error:", err.message);
                    }
                }
            }
        } catch (e) {
            console.log("inactiveKick error:", e.message);
        }
    }
};
