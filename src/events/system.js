const { ActivityType } = require("discord.js");
const { statusText, streamUrl } = require("../config/env");
const { sendLog } = require("../utils/logging");
const { ensureVoicePresence, startVoiceKeeper } = require("../utils/voice");

function registerSystemEvents(client) {
  client.once("ready", async () => {
    console.log(`[READY] Bot aktif: ${client.user.tag}`);

    client.user.setPresence({
      activities: [{ name: statusText, type: ActivityType.Streaming, url: streamUrl }],
      status: "online"
    });

    await ensureVoicePresence(client);
    startVoiceKeeper(client);

    await sendLog(client, "system", {
      title: "Bot Aktif",
      emoji: "\u{1F680}",
      summary: "Log sistemi basariyla devreye girdi.",
      description: `${client.user.tag} basariyla acildi ve sisteme baglandi.`,
      color: 0x57f287
    });
  });

  client.on("warn", async (info) => {
    await sendLog(client, "system", {
      title: "Uyari",
      emoji: "\u26A0\uFE0F",
      summary: "Discord istemcisinden uyari mesaji geldi.",
      description: String(info),
      color: 0xfee75c
    });
  });

  client.on("error", async (error) => {
    await sendLog(client, "system", {
      title: "Discord Hatasi",
      emoji: "\u{1F4A3}",
      summary: "Discord istemcisi bir hata firlatti.",
      description: `\`\`\`${String(error).slice(0, 1800)}\`\`\``,
      color: 0xed4245
    });
  });

  process.on("unhandledRejection", async (error) => {
    await sendLog(client, "system", {
      title: "Unhandled Rejection",
      emoji: "\u{1F525}",
      summary: "Yakalanmayan bir promise hatasi olustu.",
      description: `\`\`\`${String(error).slice(0, 1800)}\`\`\``,
      color: 0xed4245
    });
  });

  process.on("uncaughtException", async (error) => {
    await sendLog(client, "system", {
      title: "Uncaught Exception",
      emoji: "\u{1F9EF}",
      summary: "Uygulama seviyesinde yakalanmayan hata algilandi.",
      description: `\`\`\`${String(error).slice(0, 1800)}\`\`\``,
      color: 0xed4245
    });
  });
}

module.exports = {
  registerSystemEvents
};
