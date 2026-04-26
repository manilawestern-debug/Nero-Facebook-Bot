"use strict";

module.exports.config = {
    name: "antiText",
    eventTypes: ["message", "message_reply", "message_reaction"],
};

module.exports.execute = async function ({ api, event, config }) {
    const { threadID, senderID, body, attachments, reaction, userID } = event;

    const uid = senderID || userID;

    // ======================
    // ADMIN SAFE
    // ======================
    const admins = config.bot.admins || [];
    const superAdmins = config.bot.superAdmins || [];

    if (admins.includes(uid) || superAdmins.includes(uid)) {
        return; // admin hindi ma-kick
    }

    // ======================
    // ALLOW ONLY PHOTO & VIDEO
    // ======================
    if (attachments && attachments.length > 0) {
        const type = attachments[0].type;

        if (type === "photo" || type === "video") {
            return; // allow
        }
    }

    // ======================
    // BLOCK ALL REACTIONS
    // ======================
    if (reaction) {
        try {
            await api.gcmember("remove", uid, threadID);
        } catch (e) {}
        return;
    }

    // ======================
    // BLOCK ALL TEXT
    // ======================
    if (body) {
        try {
            await api.gcmember("remove", senderID, threadID);
        } catch (e) {}
        return;
    }

    // ======================
    // BLOCK OTHER ATTACHMENTS (stickers, audio, files)
    // ======================
    if (attachments && attachments.length > 0) {
        try {
            await api.gcmember("remove", senderID, threadID);
        } catch (e) {}
        return;
    }
};
