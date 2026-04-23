"use strict";

const warnings = new Map();

module.exports = {
  config: {
    name: "antiText",
    eventTypes: ["message"],
    enabled: true,
  },

  async execute({ api, event, config, logger }) {
    const userID = event.senderID;
    const threadID = event.threadID;

    // ignore admin
    if (config.isAdmin(userID)) return;

    // ignore bot
    if (userID == api.getCurrentUserID()) return;

    // allow images/videos only
    if (!event.body) return;

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

      // second time = kick
      await api.gcmember("remove", userID, threadID);

      warnings.delete(key);

    } catch (err) {
      logger.debug("AntiText", err.message);
    }
  },
};
