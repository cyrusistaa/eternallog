const dotenv = require("dotenv");

dotenv.config();

const required = [
  "DISCORD_TOKEN",
  "VOICE_CHANNEL_ID",
  "MEMBER_LOG_CHANNEL_ID",
  "MESSAGE_LOG_CHANNEL_ID",
  "MODERATION_LOG_CHANNEL_ID",
  "GUILD_LOG_CHANNEL_ID",
  "VOICE_LOG_CHANNEL_ID",
  "SYSTEM_LOG_CHANNEL_ID"
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} environment variable is required.`);
  }
}

const logChannels = {
  member: process.env.MEMBER_LOG_CHANNEL_ID,
  message: process.env.MESSAGE_LOG_CHANNEL_ID,
  moderation: process.env.MODERATION_LOG_CHANNEL_ID,
  guild: process.env.GUILD_LOG_CHANNEL_ID,
  voice: process.env.VOICE_LOG_CHANNEL_ID,
  system: process.env.SYSTEM_LOG_CHANNEL_ID
};

module.exports = {
  token: process.env.DISCORD_TOKEN,
  voiceChannelId: process.env.VOICE_CHANNEL_ID,
  statusText: process.env.STATUS_TEXT || "Developed By Cyrus",
  streamUrl: process.env.STREAM_URL || "https://twitch.tv/cyrus",
  logChannels
};
