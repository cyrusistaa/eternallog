const { AuditLogEvent, fetchAuditEntry } = require("../utils/audit");
const { channelLabel, diffValues, truncate, userTag } = require("../utils/format");
const { sendLog } = require("../utils/logging");

function registerMessageEvents(client) {
  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    if (message.content.startsWith("!")) {
      await sendLog(client, "message", {
        title: "Komut Kullanildi",
        emoji: "\u26A1",
        summary: "Sunucuda bir komut cagrisi algilandi.",
        color: 0x5865f2,
        author: {
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL()
        },
        thumbnail: message.author.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(message.author) },
          { name: "Kanal", value: channelLabel(message.channel), inline: true },
          { name: "Komut", value: truncate(message.content, 900), inline: false }
        ]
      });
    }
  });

  client.on("messageDelete", async (message) => {
    if (!message.guild || !message.author) return;

    const entry = await fetchAuditEntry(message.guild, AuditLogEvent.MessageDelete, message.author.id);
    await sendLog(client, "message", {
      title: "Mesaj Silindi",
      emoji: "\u{1F5D1}\uFE0F",
      summary: "Bir mesaj kanaldan kaldirildi.",
      color: 0xed4245,
      author: {
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL()
      },
      thumbnail: message.author.displayAvatarURL(),
      fields: [
        { name: "Yazar", value: userTag(message.author) },
        { name: "Kanal", value: channelLabel(message.channel), inline: true },
        { name: "Silen", value: userTag(entry?.executor), inline: true },
        { name: "Icerik", value: truncate(message.content || "Mesaj cachede yok.", 1000), inline: false }
      ]
    });
  });

  client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    await sendLog(client, "message", {
      title: "Mesaj Duzenlendi",
      emoji: "\u{1F4DD}",
      summary: "Bir mesajin icerigi guncellendi.",
      color: 0xfee75c,
      author: {
        name: newMessage.author.tag,
        iconURL: newMessage.author.displayAvatarURL()
      },
      thumbnail: newMessage.author.displayAvatarURL(),
      fields: [
        { name: "Yazar", value: userTag(newMessage.author) },
        { name: "Kanal", value: channelLabel(newMessage.channel), inline: true },
        { name: "Degisim", value: diffValues(oldMessage.content, newMessage.content), inline: false }
      ]
    });
  });

  client.on("messageDeleteBulk", async (messages, channel) => {
    if (!messages.first()?.guild) return;

    const guild = messages.first().guild;
    const entry = await fetchAuditEntry(guild, AuditLogEvent.MessageBulkDelete);
    await sendLog(client, "message", {
      title: "Toplu Mesaj Silme",
      emoji: "\u{1F4A5}",
      summary: "Birden fazla mesaj ayni anda silindi.",
      color: 0xed4245,
      fields: [
        { name: "Kanal", value: channelLabel(channel), inline: true },
        { name: "Adet", value: String(messages.size), inline: true },
        { name: "Yetkili", value: userTag(entry?.executor), inline: true }
      ]
    });
  });
}

module.exports = {
  registerMessageEvents
};
