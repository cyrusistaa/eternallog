const { PermissionsBitField } = require("discord.js");
const { AuditLogEvent, fetchAuditEntry } = require("../utils/audit");
const { formatDate, roleList, userTag } = require("../utils/format");
const { sendLog } = require("../utils/logging");

function registerMemberEvents(client) {
  client.on("guildMemberAdd", async (member) => {
    await sendLog(client, "member", {
      title: member.user.bot ? "Bot Eklendi" : "Uye Katildi",
      emoji: member.user.bot ? "\u{1F916}" : "\u{1F7E2}",
      summary: member.user.bot ? "Sunucuya yeni bir bot eklendi." : "Sunucuya yeni bir uye giris yapti.",
      color: 0x57f287,
      author: {
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL()
      },
      thumbnail: member.user.displayAvatarURL(),
      fields: [
        { name: "Kullanici", value: userTag(member.user) },
        { name: "Hesap Olusturma", value: formatDate(member.user.createdAt), inline: true },
        { name: "Sunucuya Giris", value: formatDate(new Date()), inline: true },
        { name: "Bot Mu", value: member.user.bot ? "Evet" : "Hayir", inline: true }
      ]
    });
  });

  client.on("guildMemberRemove", async (member) => {
    const kickEntry = await fetchAuditEntry(member.guild, AuditLogEvent.MemberKick, member.id);
    const description = kickEntry
      ? `Kullanici sunucudan atildi. Yetkili: ${userTag(kickEntry.executor)}`
      : "Kullanici sunucudan ayrildi.";

    await sendLog(client, "member", {
      title: kickEntry ? "Uye Kicklendi" : "Uye Ayrildi",
      emoji: kickEntry ? "\u26D4" : "\u{1F4E4}",
      summary: kickEntry ? "Bir uye yetkili tarafindan sunucudan atildi." : "Bir uye sunucudan ayrildi.",
      color: kickEntry ? 0xed4245 : 0x5865f2,
      description,
      author: {
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL()
      },
      thumbnail: member.user.displayAvatarURL(),
      fields: [
        { name: "Kullanici", value: userTag(member.user) },
        { name: "Roller", value: roleList(member.roles.cache), inline: false }
      ]
    });
  });

  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname) {
      await sendLog(client, "member", {
        title: "Takma Ad Guncellendi",
        emoji: "\u270F\uFE0F",
        summary: "Bir uyenin sunucu ici gorunen adi degisti.",
        color: 0xfee75c,
        author: {
          name: newMember.user.tag,
          iconURL: newMember.user.displayAvatarURL()
        },
        thumbnail: newMember.user.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(newMember.user) },
          { name: "Eski Takma Ad", value: oldMember.nickname || "Yok", inline: true },
          { name: "Yeni Takma Ad", value: newMember.nickname || "Yok", inline: true }
        ]
      });
    }

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const addedRoles = newRoles.filter((role) => !oldRoles.has(role.id));
    const removedRoles = oldRoles.filter((role) => !newRoles.has(role.id));

    if (addedRoles.size || removedRoles.size) {
      await sendLog(client, "member", {
        title: "Rol Guncellendi",
        emoji: "\u{1F3AD}",
        summary: "Bir uyenin rol dagilimi degisti.",
        color: 0xfee75c,
        author: {
          name: newMember.user.tag,
          iconURL: newMember.user.displayAvatarURL()
        },
        thumbnail: newMember.user.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(newMember.user) },
          { name: "Eklenen Roller", value: roleList(addedRoles), inline: false },
          { name: "Alinan Roller", value: roleList(removedRoles), inline: false }
        ]
      });
    }

    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
      const timeoutRemoved = !newMember.isCommunicationDisabled();
      const auditType = timeoutRemoved ? AuditLogEvent.MemberUpdate : AuditLogEvent.MemberUpdate;
      const entry = await fetchAuditEntry(newMember.guild, auditType, newMember.id);

      await sendLog(client, "moderation", {
        title: timeoutRemoved ? "Timeout Kaldirildi" : "Timeout Uygulandi",
        emoji: timeoutRemoved ? "\u{1F7E9}" : "\u{1F507}",
        summary: timeoutRemoved ? "Bir uyenin zaman asimi kaldirildi." : "Bir uyeye zaman asimi uygulandi.",
        color: timeoutRemoved ? 0x57f287 : 0xed4245,
        author: {
          name: newMember.user.tag,
          iconURL: newMember.user.displayAvatarURL()
        },
        thumbnail: newMember.user.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(newMember.user) },
          { name: "Yetkili", value: userTag(entry?.executor), inline: true },
          {
            name: "Bitis",
            value: timeoutRemoved || !newMember.communicationDisabledUntil
              ? "Kaldirildi"
              : formatDate(newMember.communicationDisabledUntil),
            inline: true
          }
        ]
      });
    }

    const oldAdmin = oldMember.permissions.has(PermissionsBitField.Flags.Administrator);
    const newAdmin = newMember.permissions.has(PermissionsBitField.Flags.Administrator);

    if (oldAdmin !== newAdmin) {
      await sendLog(client, "moderation", {
        title: "Yetki Yukseltme Algilandi",
        emoji: "\u{1F6A8}",
        summary: "Yonetim yetkisinde kritik bir degisiklik algilandi.",
        color: 0xed4245,
        author: {
          name: newMember.user.tag,
          iconURL: newMember.user.displayAvatarURL()
        },
        thumbnail: newMember.user.displayAvatarURL(),
        fields: [
          { name: "Kullanici", value: userTag(newMember.user) },
          { name: "Eski Durum", value: oldAdmin ? "Admin" : "Admin Degil", inline: true },
          { name: "Yeni Durum", value: newAdmin ? "Admin" : "Admin Degil", inline: true }
        ]
      });
    }
  });

  client.on("userUpdate", async (oldUser, newUser) => {
    if (oldUser.username !== newUser.username) {
      await sendLog(client, "member", {
        title: "Kullanici Adi Degisti",
        emoji: "\u{1FAAA}",
        summary: "Bir kullanicinin global Discord adi degisti.",
        color: 0x5865f2,
        author: {
          name: newUser.tag,
          iconURL: newUser.displayAvatarURL()
        },
        thumbnail: newUser.displayAvatarURL(),
        fields: [
          { name: "Kullanici ID", value: newUser.id },
          { name: "Eski Ad", value: oldUser.username, inline: true },
          { name: "Yeni Ad", value: newUser.username, inline: true }
        ]
      });
    }

    if (oldUser.avatar !== newUser.avatar) {
      await sendLog(client, "member", {
        title: "Avatar Degisti",
        emoji: "\u{1F5BC}\uFE0F",
        summary: "Bir kullanici profil gorselini yeniledi.",
        color: 0x5865f2,
        description: `${userTag(newUser)} avatarini degistirdi.`,
        author: {
          name: newUser.tag,
          iconURL: newUser.displayAvatarURL()
        },
        thumbnail: newUser.displayAvatarURL(),
        image: newUser.displayAvatarURL({ size: 1024 })
      });
    }
  });
}

module.exports = {
  registerMemberEvents
};
