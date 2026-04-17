function truncate(text, max = 1024) {
  if (!text) return "Yok";
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function channelLabel(channel) {
  return channel ? `${channel} (${channel.id})` : "Bilinmiyor";
}

function roleList(roles) {
  if (!roles || roles.size === 0) return "Yok";
  return truncate(
    roles
      .filter((role) => role.name !== "@everyone")
      .map((role) => role.toString())
      .join(", ") || "Yok"
  );
}

function userTag(user) {
  return user ? `${user.tag || user.username} (${user.id})` : "Bilinmiyor";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function diffValues(before, after) {
  return `Eski: ${truncate(String(before ?? "Yok"), 450)}\nYeni: ${truncate(String(after ?? "Yok"), 450)}`;
}

module.exports = {
  channelLabel,
  diffValues,
  formatDate,
  roleList,
  truncate,
  userTag
};
