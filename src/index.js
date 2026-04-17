const {
  Client,
  GatewayIntentBits,
  Partials
} = require("discord.js");
const { token } = require("./config/env");
const { registerEvents } = require("./events");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.User
  ]
});

registerEvents(client);

console.log("[BOOT] Discord bot girisi baslatiliyor...");

client.login(token)
  .then(() => {
    console.log("[BOOT] Discord login istegi basariyla gonderildi.");
  })
  .catch((error) => {
    console.error("[BOOT] Discord login basarisiz:", error);
    process.exit(1);
  });
