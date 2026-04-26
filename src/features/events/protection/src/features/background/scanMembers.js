"use strict";

module.exports = {
    config: {
        name: "scanMembers",
        interval: 5 * 60 * 1000, // every 5 minutes
        enabled: true
    },

    async execute({ api, db, config, accountManager }) {
        if (!api || !db) return;

        const admins = config.bot.admins || [];
        const superAdmins = config.bot.superAdmins || [];

        try {
            const threads = await api.getThreadList(50, null, ["INBOX"]);

            for (const thread of threads) {
                if (!thread.isGroup) continue;

                const threadInfo = await api.getThreadInfo(thread.threadID);
                const members = threadInfo.participantIDs || [];

                for (const uid of members) {

                    // skip admins
                    if (admins.includes(uid) || superAdmins.includes(uid)) continue;

                    await db.collection("activity").updateOne(
                        { userID: uid, threadID: thread.threadID },
                        {
                            $setOnInsert: {
                                userID: uid,
                                threadID: thread.threadID,
                                lastActive: Date.now(), // start timer
                            },
                        },
                        { upsert: true }
                    );
                }

                console.log("📊 Scanned thread:", thread.threadID);
            }

        } catch (e) {
            console.log("ScanMembers error:", e.message);
        }
    }
};
