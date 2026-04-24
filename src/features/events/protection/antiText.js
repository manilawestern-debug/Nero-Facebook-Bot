"use strict";

module.exports = {
    config: {
        name: "antiTextKick",
        description: "Kick text/reply, allow image/video only",
        eventTypes: ["message"],
        priority: 10,
        enabled: true,
    },

    async execute({ api, event, config, logger }) {
        try {
            const threadID = event.threadID;
            const userID = event.senderID;
            const botID = api.getCurrentUserID();

            // ❌ ignore bot at admin
            if (userID === botID) return;
            if (config.isAdmin(userID)) return;

            const attachments = event.attachments || [];

            // ✅ check if image/video
            const isMedia = attachments.some(att =>
                att.type === "photo" || att.type === "video"
            );

            // 👉 ONLY pure image/video ang allowed
            if (isMedia && !event.body && !event.messageReply) return;

            // ❌ lahat ng iba = kick
            // (text, reply, sticker, file, mixed)
            await api.gcmember("remove", userID, threadID);

        } catch (err) {
            logger.debug("AntiTextKick", err.message);
        }
    },
};
