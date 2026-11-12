// Telegram custom emoji are message entities, not text characters.
// Set IDs in .env; the helper falls back to ordinary emoji when an ID is missing.
const ids = {
  brand: process.env.EMOJI_BRAND,
  store: process.env.EMOJI_STORE,
  admin: process.env.EMOJI_ADMIN,
  apk: process.env.EMOJI_APK,
  broadcast: process.env.EMOJI_BROADCAST,
  forceJoin: process.env.EMOJI_FORCE_JOIN,
  owner: process.env.EMOJI_OWNER,
  success: process.env.EMOJI_SUCCESS,
  warning: process.env.EMOJI_WARNING,
  users: process.env.EMOJI_USERS
};

const fallbacks = {
  brand: '✨', store: '📦', admin: '🛡️', apk: '📱', broadcast: '📢',
  forceJoin: '🔗', owner: '👑', success: '✅', warning: '⚠️', users: '👥'
};

function richPrefix(text, key) {
  const fallback = fallbacks[key] || '✨';
  const customId = ids[key];
  const marker = '⭐'; // one Unicode symbol; Telegram custom emoji replaces this entity
  const prefix = `${customId ? marker : fallback} `;
  const options = {};
  if (customId) options.entities = [{ type: 'custom_emoji', offset: 0, length: marker.length, custom_emoji_id: String(customId) }];
  return { text: prefix + text, options };
}

function emojiIdList() {
  return { ...ids };
}

module.exports = { richPrefix, emojiIdList };
