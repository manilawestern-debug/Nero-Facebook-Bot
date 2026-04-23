"use strict";

const warnings = new Map();

module.exports = {
  config: {
    name: "antiText",
    description: "Warn then kick (text only, media allowed)",
    eventTypes: ["message"],
    priority: 20,
    enabled: true,
  },

  async execute({ api, event, config, logger }) {
    if (!event.isGroup) return;

    // ✅ IGNORE kung walang text (image, video, sticker, etc.)
    if (!event.body) return;

    const userID = event.senderID;
    const threadID = event.threadID;

    // ignore bot
    if (userID == api.getCurrentUserID()) return;

    // admin safe
    if (config.isAdmin(userID)) return;

    const key = `${threadID}-${userID}`;

    let count = warnings.get(key) || 0;
    count++;
    warnings.set(key, count);

    try {
      if (count === 1) {
        return api.sendMessage(
          "⚠️ Bawal text dito. Next = kick.",
          threadID
        );
      }

      // ❌ second text → kick (silent)
      await api.removeUserFromGroup(userID, threadID);

      warnings.delete(key);

    } catch (err) {
      logger.debug("AntiText", err.message);
    }
  },
};
