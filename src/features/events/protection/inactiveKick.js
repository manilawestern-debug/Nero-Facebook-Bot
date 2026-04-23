"use strict";

const trackers = new Map();

// 🔁 palitan mo lang value dito
const INACTIVE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 days

function makeKey(threadID, userID) {
  return `${threadID}-${userID}`;
}

module.exports = {
  config: {
    name: "inactiveKick",
    description: "Kick inactive users",
    eventTypes: ["event", "message"],
    enabled: true,
  },

  async execute({ api, event, config, logger }) {
    const botID = api.getCurrentUserID();

    // =========================
    // 🟢 USER ADDED
    // =========================
    if (event.logMessageType === "log:subscribe") {
      const threadID = event.threadID;
      const added = event.logMessageData?.addedParticipants || [];

      for (const u of added) {
        const userID = u.userFbId;
        if (!userID) continue;

        if (userID == botID) continue;
        if (config.isAdmin(userID)) continue;

        const key = makeKey(threadID, userID);

        // remove old timer
        if (trackers.has(key)) {
          clearTimeout(trackers.get(key));
          trackers.delete(key);
        }

        // start timer
        const timer = setTimeout(async () => {
          try {
            await api.gcmember("remove", userID, threadID);
          } catch (e) {
            logger.debug("InactiveKick", e.message);
          } finally {
            trackers.delete(key);
          }
        }, INACTIVE_TIME);

        trackers.set(key, timer);
      }

      return;
    }

    // =========================
    // 💬 USER CHAT
    // =========================
    if (event.body) {
      const userID = event.senderID;
      const threadID = event.threadID;

      if (userID == botID) return;
      if (config.isAdmin(userID)) return;

      const key = makeKey(threadID, userID);

      // cancel timer if nag chat
      if (trackers.has(key)) {
        clearTimeout(trackers.get(key));
        trackers.delete(key);
      }
    }
  },
};
