"use strict";

module.exports.config = {
    name: "joinTracker",
    eventTypes: ["log:subscribe"],
};

module.exports.execute = async function ({ event, db, config }) {
    if (!db) return;

    const { threadID } = event;

    const admins = config.bot.admins || [];
    const superAdmins = config.bot.superAdmins || [];

    const addedUsers = event.logMessageData.addedParticipants || [];

    for (const user of addedUsers) {
        const uid = user.userFbId;

        // skip admins
        if (admins.includes(uid) || superAdmins.includes(uid)) {
            continue;
        }

        try {
            await db.collection("activity").updateOne(
                { userID: uid, threadID },
                {
                    $set: {
                        userID: uid,
                        threadID,
                        lastActive: Date.now(), // start timer agad
                    },
                },
                { upsert: true }
            );

            console.log("👤 New user tracked:", uid);
        } catch (e) {
            console.log("JoinTracker error:", e.message);
        }
    }
};
