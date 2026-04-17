const { registerGuildChangeEvents } = require("./guildChanges");
const { registerMemberEvents } = require("./members");
const { registerMessageEvents } = require("./messages");
const { registerModerationEvents } = require("./moderation");
const { registerSystemEvents } = require("./system");
const { registerVoiceEvents } = require("./voice");

function registerEvents(client) {
  registerSystemEvents(client);
  registerMemberEvents(client);
  registerMessageEvents(client);
  registerModerationEvents(client);
  registerGuildChangeEvents(client);
  registerVoiceEvents(client);
}

module.exports = {
  registerEvents
};
