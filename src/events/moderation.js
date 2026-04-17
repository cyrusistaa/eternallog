const { AuditLogEvent, fetchAuditEntry } = require("../utils/audit");
const { truncate, userTag } = require("../utils/format");
const { sendLog } = require("../utils/logging");

function registerModerationEvents(client) {
  client.on("guildBanAdd", async (ban) => {
    const entry = await fetchAuditEntry(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);
    await sendLog(client, "moderation", {
      title: "Kullanici Banlandi",
      emoji: "\u{1F528}",
      summary: "Moderasyon sistemi bir kullaniciyi yasakladi.",
      color: 0xed4245,
      author: {
        name: ban.user.tag,
        iconURL: ban.user.displayAvatarURL()
      },
      thumbnail: ban.user.displayAvatarURL(),
      fields: [
        { name: "Kullanici", value: userTag(ban.user) },
        { name: "Yetkili", value: userTag(entry?.executor), inline: true },
        { name: "Sebep", value: truncate(entry?.reason || ban.reason || "Belirtilmedi", 1000), inline: false }
      ]
    });
  });

  client.on("guildBanRemove", async (ban) => {
    const entry = await fetchAuditEntry(ban.guild, AuditLogEvent.MemberBanRemove, ban.user.id);
    await sendLog(client, "moderation", {
      title: "Ban Kaldirildi",
      emoji: "\u{1F7E2}",
      summary: "Bir kullanicinin yasagi kaldirildi.",
      color: 0x57f287,
      author: {
        name: ban.user.tag,
        iconURL: ban.user.displayAvatarURL()
      },
      thumbnail: ban.user.displayAvatarURL(),
      fields: [
        { name: "Kullanici", value: userTag(ban.user) },
        { name: "Yetkili", value: userTag(entry?.executor), inline: true }
      ]
    });
  });
}

module.exports = {
  registerModerationEvents
};
