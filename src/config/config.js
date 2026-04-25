"use strict";

const path = require("path");
const fs = require("fs");
const settings = require("./settings");

// Load .env
try {
    process.env.DOTENV_CONFIG_QUIET = "true";
    require("dotenv").config({
        path: path.resolve(__dirname, "..", "..", ".env"),
    });
} catch {}

// Dynamic config
const dynamicConfigPath = path.resolve(__dirname, "dynamic.json");
let dynamicConfig = {
    admins: [],
    blockedUsers: [],
    blockedThreads: [],
};

try {
    if (fs.existsSync(dynamicConfigPath)) {
        const fileContent = fs.readFileSync(dynamicConfigPath, "utf8");
        dynamicConfig = JSON.parse(fileContent);
    }
} catch (error) {
    console.error("Failed to load dynamic config:", error);
}

function saveDynamicConfig(newConfig) {
    try {
        fs.writeFileSync(dynamicConfigPath, JSON.stringify(newConfig, null, 2));
        return true;
    } catch (error) {
        console.error("Failed to save dynamic config:", error);
        return false;
    }
}

const config = {
    bot: {
        name: "Nero Bot",
        version: "1.0.0",
        description: "Messenger bot",
        timeZone: "Asia/Manila",
        prefixEnabled: false,
        prefix: "!",
        botPrefix: ".",
        alternativePrefixes: ["/", "-"],
        admins: dynamicConfig.admins || [],
        superAdmins: process.env.SUPER_ADMINS
            ? process.env.SUPER_ADMINS.split(",").map((id) => id.trim())
            : [],
        blockedUsers: dynamicConfig.blockedUsers || [],
        blockedThreads: dynamicConfig.blockedThreads || [],
    },

    neroOptions: settings.neroOptions,

    paths: {
        root: path.resolve(__dirname, "..", ".."),
        src: path.resolve(__dirname, ".."),

        commands: path.resolve(__dirname, "..", "features", "commands"),
        events: path.resolve(__dirname, "..", "features", "events"),
        background: path.resolve(__dirname, "..", "features", "background"),
        config: path.resolve(__dirname),
        handlers: path.resolve(__dirname, "..", "handlers"),
        utils: path.resolve(__dirname, "..", "utils"),
        core: path.resolve(__dirname, "..", "core"),

        accounts: path.resolve(__dirname, "..", "..", "accounts"),
        logs: path.resolve(__dirname, "..", "..", "logs"),
        data: path.resolve(__dirname, "..", "..", "data"),
    },

    commands: {
        ...settings.commands,
        directories: ["admin", "user"],
    },

    events: {
        ...settings.events,
        directories: ["welcome", "protection", "AI", "media"],
    },

    // ✅ FIXED PART (NO EXTRA BRACE)
    background: {
        ...settings.background,
        directories: ["background"],
    },

    logging: settings.logging,

    rateLimit: settings.rateLimit,

    env: {
        nodeEnv: process.env.NODE_ENV || "development",
        debug: process.env.DEBUG === "true" || false,
    },

    apiKeys: {
        gemini: process.env.GEMINI_API_KEY || "",
        geminiBackups: (process.env.GEMINI_BACKUP_KEYS || "")
            .split(",")
            .map((key) => key.trim())
            .filter((key) => key.length > 0),
    },

    geniusClientId: process.env.GENIUS_CLIENT_ID || "",
    geniusClientSecret: process.env.GENIUS_CLIENT_SECRET || "",

    server: {
        enabled: true,
        port: 30174,
        host: "0.0.0.0",
        logStartup: false,
        logRequests: false,

        apiKey: process.env.NERO_API_KEY || "",
        requireAuth: true,
        publicEndpoints: ["/api/stats", "/", "/favicon.ico"],

        rateLimit: {
            enabled: true,
            windowMs: 60000,
            maxRequests: 100,
            skipSuccessfulRequests: false,
            message: "Too many requests",
        },
    },
};

// Helpers
config.get = function (configPath, defaultValue = null) {
    const keys = configPath.split(".");
    let result = this;
    for (const key of keys) {
        if (result && typeof result === "object" && key in result) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }
    return result;
};

config.isAdmin = function (userId) {
    return this.bot.admins.includes(userId) || this.bot.superAdmins.includes(userId);
};

config.isSuperAdmin = function (userId) {
    return this.bot.superAdmins.includes(userId);
};

config.isBlocked = function (userId) {
    return this.bot.blockedUsers.includes(userId);
};

config.isThreadBlocked = function (threadId) {
    return this.bot.blockedThreads.includes(threadId);
};

// Freeze
Object.freeze(config.bot);
Object.freeze(config.paths);
Object.freeze(config.commands);
Object.freeze(config.events);
Object.freeze(config.background);
Object.freeze(config.env);
Object.freeze(config.apiKeys);
Object.freeze(config.server);
Object.freeze(config.server.rateLimit);

module.exports = config;
