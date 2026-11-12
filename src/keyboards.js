const { Markup } = require('telegraf');

const mainMenu = () => Markup.inlineKeyboard([
  [Markup.button.callback('📦  Browse APK Store', 'view_apks')],
  [Markup.button.callback('🔄  Verify Membership', 'verify_join')],
  [Markup.button.callback('👑  Owner Support', 'owner_contact')]
]);

const adminMenu = () => Markup.inlineKeyboard([
  [Markup.button.callback('📦  Add APK', 'admin_add_apk'), Markup.button.callback('🗑  Remove APK', 'admin_delete_apk')],
  [Markup.button.callback('📢  Broadcast', 'admin_broadcast'), Markup.button.callback('📊  Statistics', 'admin_stats')],
  [Markup.button.callback('🔗  Add Force Join', 'admin_add_force'), Markup.button.callback('⚙️  Manage Channels', 'admin_force_list')],
  [Markup.button.callback('🚫  Ban User', 'admin_ban'), Markup.button.callback('✅  Unban User', 'admin_unban')],
  [Markup.button.callback('🧹  Remove Force Join', 'admin_delete_force')]
]);

const backToAdmin = () => Markup.inlineKeyboard([[Markup.button.callback('⬅️ Admin Panel', 'admin_panel')]]);
const backToHome = () => Markup.inlineKeyboard([[Markup.button.callback('🏠 Main Menu', 'main_menu')]]);

module.exports = { mainMenu, adminMenu, backToAdmin, backToHome };
