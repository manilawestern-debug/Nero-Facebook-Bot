"use strict";

module.exports = {
  config: {
    name: "antiText",
    eventTypes: ["message"],
    priority: 10,
    enabled: true,
  },

  async execute({ api, event, config }) {
    const { threadID, senderID, body, messageReply, attachments } = event;

    const botID = api.getCurrentUserID();

    // ignore sarili ng bot
    if (senderID === botID) return;

    // ignore admins
    if (config.isAdmin(senderID)) return;

    // ❌ ignore system messages (walang body at walang reply)
    if (!body && !messageReply) return;

    // ❌ ignore image/video/files
    if (attachments && attachments.length > 0) return;

    try {
      // ✅ kick agad
      await api.gcmember("remove", senderID, threadID);
    } catch (err) {
      console.log("AntiText error:", err.message);
    }
  },
};
