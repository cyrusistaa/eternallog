const { ChannelType } = require("discord.js");
const { voiceChannelId } = require("../config/env");
const { sendLog } = require("./logging");

let keepAliveInterval = null;
let isMoving = false;

async function getTargetChannel(client) {
  const channel = await client.channels.fetch(voiceChannelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    await sendLog(client, "system", {
      title: "Ses Baglantisi Basarisiz",
      description: "VOICE_CHANNEL_ID gecersiz ya da kanal ses kanali degil.",
      color: 0xed4245
    });
    return null;
  }

  if (!channel.joinable) {
    await sendLog(client, "system", {
      title: "Ses Kanalina Girilemiyor",
      description: "Botun hedef ses kanalina baglanma izni yok.",
      color: 0xed4245
    });
    return null;
  }

  return channel;
}

async function ensureVoicePresence(client) {
  if (isMoving) return;

  const channel = await getTargetChannel(client);
  if (!channel) return;

  const me = await channel.guild.members.fetchMe().catch(() => null);
  if (!me) return;

  if (me.voice.channelId === channel.id) return;

  isMoving = true;

  try {
    await me.voice.setChannel(channel, "Bot sabit ses kanalinda kalacak");

    if (!me.voice.deaf && me.voice.channelId === channel.id) {
      await me.voice.setDeaf(true, "Bot kulakligi kapali kalacak").catch(() => null);
    }

    await sendLog(client, "system", {
      title: "Ses Kanalina Baglandi",
      emoji: "\u{1F3A7}",
      summary: "Bot hedef ses kanalinda sabitlendi.",
      description: `${channel.name} kanalinda beklemeye alindi.`,
      color: 0x57f287
    });
  } catch (error) {
    await sendLog(client, "system", {
      title: "Ses Kanalina Tasima Hatasi",
      description: `\`\`\`${String(error).slice(0, 1800)}\`\`\``,
      color: 0xed4245
    });
  } finally {
    isMoving = false;
  }
}

function startVoiceKeeper(client) {
  if (keepAliveInterval) clearInterval(keepAliveInterval);

  keepAliveInterval = setInterval(() => {
    ensureVoicePresence(client).catch(() => null);
  }, 30_000);
}

module.exports = {
  ensureVoicePresence,
  startVoiceKeeper
};
