const { EmbedBuilder, ChannelType } = require("discord.js");
const { logChannels, statusText } = require("../config/env");

async function getLogChannel(client, category) {
  const channelId = logChannels[category];
  if (!channelId) return null;

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) return null;
  return channel;
}

function normalizeFields(fields = []) {
  return fields
    .filter((field) => field && field.value)
    .slice(0, 24)
    .map((field) => ({
      name: field.name.startsWith("*") ? field.name : `* ${field.name}`,
      value: field.value,
      inline: Boolean(field.inline)
    }));
}

function makeEmbed({
  title,
  description,
  color = 0x2b2d31,
  fields = [],
  emoji = "*",
  summary,
  author,
  thumbnail,
  image
}) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${emoji} ${title}`)
    .setFooter({ text: `${statusText} | Cyrus Log System` })
    .setTimestamp();

  if (author?.name) {
    embed.setAuthor({
      name: author.name,
      iconURL: author.iconURL || undefined
    });
  }

  if (thumbnail) embed.setThumbnail(thumbnail);
  if (image) embed.setImage(image);

  const lines = [];
  if (summary) lines.push(`**${summary}**`);
  if (description) lines.push(description);
  if (lines.length) embed.setDescription(lines.join("\n\n"));

  const normalizedFields = normalizeFields(fields);
  if (normalizedFields.length) embed.addFields(normalizedFields);

  return embed;
}

async function sendLog(client, category, data) {
  const channel = await getLogChannel(client, category);
  if (!channel) return;

  const embed = makeEmbed(data);
  await channel.send({ embeds: [embed] }).catch(() => null);
}

module.exports = {
  sendLog
};
