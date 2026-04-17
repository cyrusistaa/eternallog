const { channelLabel, userTag } = require("../utils/format");
const { sendLog } = require("../utils/logging");

function registerVoiceEvents(client) {
  client.on("voiceStateUpdate", async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    if (!oldState.channelId && newState.channelId) {
      await sendLog(client, "voice", {
        title: "Ses Kanalina Giris",
        emoji: "\u{1F3A7}",
        summary: "Bir uye ses kanalina baglandi.",
        color: 0x57f287,
        author: {
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL()
        },
        thumbnail: member.user.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(member.user) },
          { name: "Kanal", value: channelLabel(newState.channel), inline: true }
        ]
      });
      return;
    }

    if (oldState.channelId && !newState.channelId) {
      await sendLog(client, "voice", {
        title: "Ses Kanalindan Cikis",
        emoji: "\u{1F4F4}",
        summary: "Bir uye ses kanalindan ayrildi.",
        color: 0xed4245,
        author: {
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL()
        },
        thumbnail: member.user.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(member.user) },
          { name: "Kanal", value: channelLabel(oldState.channel), inline: true }
        ]
      });
      return;
    }

    if (oldState.channelId !== newState.channelId) {
      await sendLog(client, "voice", {
        title: "Ses Kanali Degisti",
        emoji: "\u{1F504}",
        summary: "Bir uye baska bir ses kanalina tasindi.",
        color: 0xfee75c,
        author: {
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL()
        },
        thumbnail: member.user.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(member.user) },
          { name: "Eski Kanal", value: channelLabel(oldState.channel), inline: true },
          { name: "Yeni Kanal", value: channelLabel(newState.channel), inline: true }
        ]
      });
    }

    if (oldState.serverMute !== newState.serverMute) {
      await sendLog(client, "voice", {
        title: "Sunucu Mute Degisti",
        emoji: "\u{1F507}",
        summary: "Bir kullanicinin sunucu mute durumu degisti.",
        color: 0xfee75c,
        author: {
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL()
        },
        thumbnail: member.user.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(member.user) },
          { name: "Durum", value: newState.serverMute ? "Mute verildi" : "Mute kaldirildi", inline: true }
        ]
      });
    }

    if (oldState.serverDeaf !== newState.serverDeaf) {
      await sendLog(client, "voice", {
        title: "Sunucu Deafen Degisti",
        emoji: "\u{1F6D1}",
        summary: "Bir kullanicinin kulaklik erisimi guncellendi.",
        color: 0xfee75c,
        author: {
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL()
        },
        thumbnail: member.user.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(member.user) },
          { name: "Durum", value: newState.serverDeaf ? "Kulaklik kapatildi" : "Kulaklik acildi", inline: true }
        ]
      });
    }
  });
}

module.exports = {
  registerVoiceEvents
};
