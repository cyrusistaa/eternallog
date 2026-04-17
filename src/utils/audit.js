const { AuditLogEvent } = require("discord.js");

async function fetchAuditEntry(guild, type, targetId) {
  try {
    const logs = await guild.fetchAuditLogs({ type, limit: 6 });
    const entry = logs.entries.find((item) => {
      const createdRecently = Date.now() - item.createdTimestamp < 15000;
      const sameTarget = !targetId || item.target?.id === targetId;
      return createdRecently && sameTarget;
    });

    return entry || null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  AuditLogEvent,
  fetchAuditEntry
};
