const { entersState, joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");
const { ChannelType } = require("discord.js");
const { voiceChannelId } = require("../config/env");
const { sendLog } = require("./logging");

async function ensureVoiceConnection(client) {
  const channel = await client.channels.fetch(voiceChannelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    await sendLog(client, "system", {
      title: "Ses Baglantisi Basarisiz",
      description: "VOICE_CHANNEL_ID gecersiz ya da kanal ses kanali degil.",
      color: 0xed4245
    });
    return null;
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    return connection;
  } catch (error) {
    connection.destroy();
    await sendLog(client, "system", {
      title: "Ses Baglantisi Zaman Asimi",
      description: "Bot hedef ses kanalina baglanamadi.",
      color: 0xed4245
    });
    return null;
  }
}

module.exports = {
  ensureVoiceConnection,
  VoiceConnectionStatus
};
