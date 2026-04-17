const {
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus
} = require("@discordjs/voice");
const { ChannelType } = require("discord.js");
const { voiceChannelId } = require("../config/env");
const { sendLog } = require("./logging");

let reconnectTimer = null;
let isConnecting = false;

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect(client, delay = 5_000) {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await ensureVoiceConnection(client);
  }, delay);
}

async function ensureVoiceConnection(client) {
  if (isConnecting) return getCurrentConnection(client);

  const channel = await client.channels.fetch(voiceChannelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    await sendLog(client, "system", {
      title: "Ses Baglantisi Basarisiz",
      description: "VOICE_CHANNEL_ID gecersiz ya da kanal ses kanali degil.",
      color: 0xed4245
    });
    return null;
  }

  const existing = getVoiceConnection(channel.guild.id);
  if (existing && existing.joinConfig.channelId === channel.id) {
    return existing;
  }

  if (existing) {
    existing.destroy();
  }

  isConnecting = true;

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false
  });

  connection.removeAllListeners(VoiceConnectionStatus.Disconnected);
  connection.removeAllListeners(VoiceConnectionStatus.Destroyed);

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    await sendLog(client, "system", {
      title: "Ses Baglantisi Koptu",
      emoji: "\u{1F4E1}",
      summary: "Bot ses kanalindan dustu.",
      description: "Baglanti yeniden kurulmaya calisiliyor.",
      color: 0xed4245
    });

    scheduleReconnect(client);
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    scheduleReconnect(client);
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    clearReconnectTimer();
    return connection;
  } catch (error) {
    connection.destroy();
    await sendLog(client, "system", {
      title: "Ses Baglantisi Zaman Asimi",
      description: "Bot hedef ses kanalina baglanamadi.",
      color: 0xed4245
    });
    scheduleReconnect(client, 10_000);
    return null;
  } finally {
    isConnecting = false;
  }
}

function getCurrentConnection(client) {
  const guild = client.guilds.cache.find((item) => getVoiceConnection(item.id));
  return guild ? getVoiceConnection(guild.id) : null;
}

module.exports = {
  ensureVoiceConnection,
  VoiceConnectionStatus
};
