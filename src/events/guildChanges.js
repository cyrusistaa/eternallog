const { AuditLogEvent, fetchAuditEntry } = require("../utils/audit");
const { channelLabel, diffValues, truncate, userTag } = require("../utils/format");
const { sendLog } = require("../utils/logging");

function registerGuildChangeEvents(client) {
  client.on("channelCreate", async (channel) => {
    const entry = await fetchAuditEntry(channel.guild, AuditLogEvent.ChannelCreate, channel.id);
    await sendLog(client, "guild", {
      title: "Kanal Olusturuldu",
      emoji: "\u{1F9F1}",
      summary: "Sunucuda yeni bir kanal olusturuldu.",
      color: 0x57f287,
      fields: [
        { name: "Kanal", value: channelLabel(channel) },
        { name: "Yetkili", value: userTag(entry?.executor), inline: true },
        { name: "Tur", value: String(channel.type), inline: true }
      ]
    });
  });

  client.on("channelDelete", async (channel) => {
    const entry = await fetchAuditEntry(channel.guild, AuditLogEvent.ChannelDelete, channel.id);
    await sendLog(client, "guild", {
      title: "Kanal Silindi",
      emoji: "\u{1F5D1}\uFE0F",
      summary: "Sunucudan bir kanal kaldirildi.",
      color: 0xed4245,
      fields: [
        { name: "Kanal", value: `${channel.name} (${channel.id})` },
        { name: "Yetkili", value: userTag(entry?.executor), inline: true }
      ]
    });
  });

  client.on("channelUpdate", async (oldChannel, newChannel) => {
    if (oldChannel.name !== newChannel.name) {
      await sendLog(client, "guild", {
        title: "Kanal Duzenlendi",
        emoji: "\u{1F6E0}\uFE0F",
        summary: "Bir kanal ayarinda degisiklik yapildi.",
        color: 0xfee75c,
        fields: [
          { name: "Kanal ID", value: newChannel.id },
          { name: "Degisim", value: diffValues(oldChannel.name, newChannel.name) }
        ]
      });
    }
  });

  client.on("roleCreate", async (role) => {
    const entry = await fetchAuditEntry(role.guild, AuditLogEvent.RoleCreate, role.id);
    await sendLog(client, "guild", {
      title: "Rol Olusturuldu",
      emoji: "\u2728",
      summary: "Sunucuya yeni bir rol eklendi.",
      color: 0x57f287,
      fields: [
        { name: "Rol", value: `${role} (${role.id})` },
        { name: "Yetkili", value: userTag(entry?.executor), inline: true }
      ]
    });
  });

  client.on("roleDelete", async (role) => {
    const entry = await fetchAuditEntry(role.guild, AuditLogEvent.RoleDelete, role.id);
    await sendLog(client, "guild", {
      title: "Rol Silindi",
      emoji: "\u274C",
      summary: "Bir rol sunucudan silindi.",
      color: 0xed4245,
      fields: [
        { name: "Rol", value: `${role.name} (${role.id})` },
        { name: "Yetkili", value: userTag(entry?.executor), inline: true }
      ]
    });
  });

  client.on("roleUpdate", async (oldRole, newRole) => {
    if (oldRole.name !== newRole.name || oldRole.color !== newRole.color || oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      await sendLog(client, "guild", {
        title: "Rol Guncellendi",
        emoji: "\u{1F3A8}",
        summary: "Rol bilgileri veya izinleri guncellendi.",
        color: 0xfee75c,
        fields: [
          { name: "Rol", value: `${newRole} (${newRole.id})` },
          { name: "Eski Isim", value: oldRole.name, inline: true },
          { name: "Yeni Isim", value: newRole.name, inline: true },
          {
            name: "Yetki Degisimi",
            value: oldRole.permissions.bitfield !== newRole.permissions.bitfield ? "Izinler degisti" : "Yok"
          }
        ]
      });
    }
  });

  client.on("webhooksUpdate", async (channel) => {
    const entry = await fetchAuditEntry(channel.guild, AuditLogEvent.WebhookCreate);
    await sendLog(client, "guild", {
      title: "Webhook Hareketi",
      emoji: "\u{1FA9D}",
      summary: "Webhook tarafinda bir degisiklik algilandi.",
      color: 0xfee75c,
      fields: [
        { name: "Kanal", value: channelLabel(channel) },
        { name: "Yetkili", value: userTag(entry?.executor), inline: true },
        { name: "Detay", value: entry ? `${entry.action} islemi algilandi` : "Webhook degisikligi algilandi", inline: false }
      ]
    });
  });

  client.on("guildUpdate", async (oldGuild, newGuild) => {
    if (oldGuild.name !== newGuild.name) {
      await sendLog(client, "guild", {
        title: "Sunucu Ayari Guncellendi",
        emoji: "\u{1F3F0}",
        summary: "Sunucunun genel ayarlarinda degisiklik yapildi.",
        color: 0xfee75c,
        fields: [
          { name: "Degisim", value: diffValues(oldGuild.name, newGuild.name) }
        ]
      });
    }
  });

  client.on("inviteCreate", async (invite) => {
    await sendLog(client, "guild", {
      title: "Davet Olusturuldu",
      emoji: "\u{1F4E8}",
      summary: "Yeni bir davet baglantisi olusturuldu.",
      color: 0x57f287,
      fields: [
        { name: "Kod", value: invite.code, inline: true },
        { name: "Kanal", value: channelLabel(invite.channel), inline: true },
        { name: "Olusturan", value: userTag(invite.inviter), inline: true }
      ]
    });
  });

  client.on("inviteDelete", async (invite) => {
    await sendLog(client, "guild", {
      title: "Davet Silindi",
      emoji: "\u{1F9E8}",
      summary: "Bir davet baglantisi iptal edildi.",
      color: 0xed4245,
      fields: [
        { name: "Kod", value: invite.code || "Bilinmiyor", inline: true },
        { name: "Kanal", value: channelLabel(invite.channel), inline: true }
      ]
    });
  });

  client.on("guildAuditLogEntryCreate", async (entry, guild) => {
    if (![AuditLogEvent.WebhookCreate, AuditLogEvent.WebhookDelete, AuditLogEvent.WebhookUpdate].includes(entry.action)) {
      return;
    }

    await sendLog(client, "guild", {
      title: "Audit Log Olayi",
      emoji: "\u{1F4DA}",
      summary: "Audit log tarafinda kritik bir kayit olustu.",
      color: 0x5865f2,
      fields: [
        { name: "Sunucu", value: guild.name, inline: true },
        { name: "Yetkili", value: userTag(entry.executor), inline: true },
        { name: "Islem", value: String(entry.action), inline: true },
        { name: "Sebep", value: truncate(entry.reason || "Belirtilmedi", 1000), inline: false }
      ]
    });
  });
}

module.exports = {
  registerGuildChangeEvents
};
