const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const { ChannelType } = require("discord.js");
const { voiceChannelId } = require("../config/env");
const { sendLog } = require("./logging");

let rejoinTimer = null;

async function getTargetChannel(client) {
  const channel = await client.channels.fetch(voiceChannelId).catch(() => null);
  console.log(`[VOICE] Hedef kanal araniyor: ${voiceChannelId}`);

  if (!channel || (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice)) {
    await sendLog(client, "system", {
      title: "Ses Baglantisi Basarisiz",
      description: "VOICE_CHANNEL_ID gecersiz ya da kanal ses/stage kanali degil.",
      color: 0xed4245
    });
    return null;
  }

  if (!channel.joinable) {
    await sendLog(client, "system", {
      title: "Ses Kanalina Girilemiyor",
      description: "Botun hedef ses kanalina girme izni yok.",
      color: 0xed4245
    });
    return null;
  }

  return channel;
}

async function joinTargetVoiceChannel(client) {
  const channel = await getTargetChannel(client);
  if (!channel) return null;

  const oldConnection = getVoiceConnection(channel.guild.id);
  if (oldConnection) {
    oldConnection.destroy();
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false,
    group: client.user.id
  });

  console.log(`[VOICE] "${channel.name}" kanalina giris denendi.`);

  await sendLog(client, "system", {
    title: "Ses Kanalina Baglandi",
    emoji: "\u{1F3A7}",
    summary: "Bot hedef ses kanalina giris yapti.",
    description: `${channel.name} kanalinda beklemeye alindi.`,
    color: 0x57f287
  });

  return connection;
}

function scheduleVoiceRejoin(client, delay = 5_000) {
  if (rejoinTimer) return;

  rejoinTimer = setTimeout(async () => {
    rejoinTimer = null;
    await joinTargetVoiceChannel(client);
  }, delay);
}

function registerVoiceGuard(client) {
  client.on("voiceStateUpdate", async (oldState, newState) => {
    if (!client.user) return;
    if (oldState.id !== client.user.id && newState.id !== client.user.id) return;

    const targetChannel = await getTargetChannel(client);
    if (!targetChannel) return;

    if (newState.channelId === targetChannel.id) {
      console.log("[VOICE] Bot hedef ses kanalinda.");
      return;
    }

    console.log("[VOICE] Bot hedef ses kanalindan ayrildi, yeniden girilecek.");
    scheduleVoiceRejoin(client);
  });
}

module.exports = {
  joinTargetVoiceChannel,
  registerVoiceGuard
};
