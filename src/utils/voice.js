const {
  entersState,
  generateDependencyReport,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus
} = require("@discordjs/voice");
const { ChannelType } = require("discord.js");
const { voiceChannelId } = require("../config/env");
const { sendLog } = require("./logging");

let reconnectTimer = null;
let keepAliveTimer = null;
let isConnecting = false;

function canUseChannel(channel) {
  return channel && (
    channel.type === ChannelType.GuildVoice ||
    channel.type === ChannelType.GuildStageVoice
  );
}

function startVoiceStateKeepAlive(client, channel) {
  if (keepAliveTimer) clearInterval(keepAliveTimer);

  keepAliveTimer = setInterval(() => {
    try {
      const shard = client.ws.shards.get(channel.guild.shardId);
      if (!shard) return;

      console.log("[VOICE] Voice state keepalive gonderiliyor...");
      shard.send({
        op: 4,
        d: {
          guild_id: channel.guild.id,
          channel_id: channel.id,
          self_mute: false,
          self_deaf: true
        }
      });
    } catch (error) {
      console.error("[VOICE] Keepalive gonderilemedi:", error);
    }
  }, 15_000);
}

function stopVoiceStateKeepAlive() {
  if (!keepAliveTimer) return;
  clearInterval(keepAliveTimer);
  keepAliveTimer = null;
}

function scheduleReconnect(client, delay = 8_000) {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await ensureVoiceConnection(client);
  }, delay);
}

function clearReconnectTimer() {
  if (!reconnectTimer) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
}

async function getTargetChannel(client) {
  const channel = await client.channels.fetch(voiceChannelId).catch(() => null);
  console.log(`[VOICE] Hedef kanal araniyor: ${voiceChannelId}`);

  if (!canUseChannel(channel)) {
    console.log("[VOICE] Kanal bulunamadi ya da ses/stage kanali degil.");
    await sendLog(client, "system", {
      title: "Ses Baglantisi Basarisiz",
      description: "VOICE_CHANNEL_ID gecersiz ya da kanal ses/stage kanali degil.",
      color: 0xed4245
    });
    return null;
  }

  if (!channel.joinable) {
    console.log("[VOICE] Kanal joinable degil. Botun Connect/View izni eksik olabilir.");
    await sendLog(client, "system", {
      title: "Ses Kanalina Girilemiyor",
      description: "Botun hedef ses kanalina girme izni yok.",
      color: 0xed4245
    });
    return null;
  }

  return channel;
}

function attachConnectionListeners(client, channel, connection) {
  if (connection.__cyrusListenersAttached) return;
  connection.__cyrusListenersAttached = true;

  connection.on("stateChange", (oldState, newState) => {
    console.log(`[VOICE] ${oldState.status} -> ${newState.status}`);

    if (newState.status === VoiceConnectionStatus.Ready) {
      clearReconnectTimer();
      startVoiceStateKeepAlive(client, channel);
    }
  });

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    console.log("[VOICE] Baglanti koptu, kurtarma deneniyor...");
    stopVoiceStateKeepAlive();

    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
      ]);
      console.log("[VOICE] Baglanti kendi kendine toparladi.");
    } catch (error) {
      console.error("[VOICE] Baglanti toparlanamadi, yeniden kurulacak.", error);
      connection.destroy();

      await sendLog(client, "system", {
        title: "Ses Baglantisi Koptu",
        emoji: "\u{1F4E1}",
        summary: "Bot ses kanalindan dustu.",
        description: "Baglanti yeniden kuruluyor.",
        color: 0xed4245
      });

      scheduleReconnect(client);
    }
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log("[VOICE] Baglanti yok edildi, yeniden baglaniyor...");
    stopVoiceStateKeepAlive();
    scheduleReconnect(client);
  });
}

async function ensureVoiceConnection(client) {
  if (isConnecting) return null;

  const channel = await getTargetChannel(client);
  if (!channel) return null;

  const existing = getVoiceConnection(channel.guild.id);
  if (existing && existing.joinConfig.channelId === channel.id && existing.state.status !== VoiceConnectionStatus.Destroyed) {
    console.log(`[VOICE] Mevcut baglanti bulundu: ${existing.state.status}`);
    return existing;
  }

  isConnecting = true;

  try {
    const connection = existing || joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false
    });

    if (existing) {
      existing.rejoin({
        channelId: channel.id,
        selfDeaf: true,
        selfMute: false
      });
    }

    attachConnectionListeners(client, channel, connection);

    console.log(`[VOICE] Baglanma deneniyor... guild=${channel.guild.id} channel=${channel.id}`);
    console.log(generateDependencyReport());

    await entersState(connection, VoiceConnectionStatus.Ready, 60_000);
    startVoiceStateKeepAlive(client, channel);

    await sendLog(client, "system", {
      title: "Ses Kanalina Baglandi",
      emoji: "\u{1F3A7}",
      summary: "Bot hedef ses kanalinda aktif.",
      description: `${channel.name} kanalina baglanildi ve kulaklik kapatildi.`,
      color: 0x57f287
    });

    clearReconnectTimer();
    return connection;
  } catch (error) {
    console.error("[VOICE] Ses baglantisi kurulurken hata:", error);

    const current = getVoiceConnection(channel.guild.id);
    if (current) current.destroy();

    stopVoiceStateKeepAlive();

    await sendLog(client, "system", {
      title: "Ses Baglantisi Zaman Asimi",
      summary: "Bot kanalda gorunse de voice baglantisi Ready durumuna gecemedi.",
      description: `\`\`\`${String(error).slice(0, 1800)}\`\`\``,
      color: 0xed4245
    });

    scheduleReconnect(client, 12_000);
    return null;
  } finally {
    isConnecting = false;
  }
}

module.exports = {
  ensureVoiceConnection
};
