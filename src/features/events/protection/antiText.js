"use strict";

module.exports.config = {
    name: "antiText",
    eventTypes: ["message"],
    priority: 10,
    enabled: true,
};

module.exports.execute = async function ({ api, event, config }) {
    const { threadID, senderID, body, attachments } = event;

    const admins = config.bot.admins || [];
    const superAdmins = config.bot.superAdmins || [];

    // skip admins
    if (admins.includes(senderID) || superAdmins.includes(senderID)) {
        return;
    }

    // detect text only
    if (body && (!attachments || attachments.length === 0)) {
        try {
            await api.sendMessage(
                "❌ Bawal text dito! Image/Video lang.",
                threadID
            );

            await api.removeUserFromGroup(senderID, threadID);
        } catch (e) {
            console.log(e);
        }
    }
};
