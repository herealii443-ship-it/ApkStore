require('dotenv').config();
const path = require('path');
const { Telegraf, Markup, session } = require('telegraf');
const Store = require('./store');
const { backToAdmin, backToHome } = require('./keyboards');

const token = process.env.BOT_TOKEN;
const ownerId = Number(process.env.OWNER_ID);
const ownerUsername = (process.env.OWNER_USERNAME || '').replace(/^@/, '');
const botName = process.env.BOT_NAME || 'Epic APK Store';
const dataFile = process.env.DATA_FILE || './data/store.json';
const MENU_MEDIA_URL = process.env.MENU_MEDIA_URL || '';
const MENU_MEDIA_TYPE = (process.env.MENU_MEDIA_TYPE || 'video').toLowerCase();

if (!token || !ownerId) {
  console.error('Missing BOT_TOKEN or OWNER_ID. Copy .env.example to .env and fill both values.');
  process.exit(1);
}

const bot = new Telegraf(token);
const store = new Store(path.resolve(process.cwd(), dataFile));

const isAdmin = (ctx) => Number(ctx.from?.id) === ownerId;
const isBanned = (ctx) => Boolean(store.getUser(ctx.from?.id)?.banned);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[char]));

// ============================================================
// PREMIUM EMOJI MAP
// ============================================================
const CUSTOM_EMOJI = {
  buttons: {
    browse:    { id: '4936296803390718929', fallback: '📱' },
    contact:   { id: '4936372454944670967', fallback: '💬' },
    admin:     { id: '4938682391435674655', fallback: '🛠' },
    apk:       { id: '4936118759816430529', fallback: '📱' },
    home:      { id: '4938719044686578828', fallback: '🏠' },
    verify:    { id: '4938623262620910682', fallback: '✅' },
    join:      { id: '4990054482378228849', fallback: '📣' },
    stats:     { id: '5091340913708369683', fallback: '📊' },
    forcelist: { id: '6082431104323688791', fallback: '🔗' },
    broadcast: { id: '6082548223786883514', fallback: '📢' },
    addapk:    { id: '6080248097001184270', fallback: '➕' },
    delapk:    { id: '6082648734611545526', fallback: '🗑' },
    addforce:  { id: '6091337663904752792', fallback: '🔗' },
    delforce:  { id: '6091228618980073187', fallback: '✖️' },
    ban:       { id: '5465206035729906349', fallback: '🚫' },
    unban:     { id: '5474197700087932281', fallback: '✅' },
    back:      { id: '6082243040590697604', fallback: '⬅️' },
    download:  { id: '5363992034728229166', fallback: '📥' },
    store:     { id: '5345905193005371012', fallback: '🛒' },
    arrow:     { id: '5199785165735367039', fallback: '➡️' },
  },
  headings: {
    brand:     { id: '5319213852456402176', fallback: '📦' },
    hello:     { id: '5789893399960098113', fallback: '👋' },
    locked:    { id: '5332780408603947530', fallback: '🔒' },
    adminhead: { id: '6266905902511559661', fallback: '🛠' },
    statshead: { id: '6267152480878990865', fallback: '📊' },
    forcehead: { id: '6282760761399841824', fallback: '🔗' },
    contacth:  { id: '6285088169817805553', fallback: '💬' },
    storehead: { id: '4970075093381153851', fallback: '🛒' },
  },
  tables: {
    info:      { id: '5335066048464972032', fallback: 'ℹ️' },
    status:    { id: '5334984207863151917', fallback: '📌' },
    count:     { id: '5334923953766953661', fallback: '#️⃣' },
    title:     { id: '5332439959431310026', fallback: '🏷' },
    file:      { id: '5334796732540678877', fallback: '📄' },
    metric:    { id: '5332809438287913573', fallback: '📈' },
    value:     { id: '5334805910885790103', fallback: '💠' },
    detail:    { id: '5334705202492630985', fallback: '🔎' },
    chatid:    { id: '5332683462602160201', fallback: '🆔' },
    reason:    { id: '5332480744440754516', fallback: '⚠️' },
  },
  details: {
    creator:   { id: '5332505401847999304', fallback: '👤' },
    version:   { id: '5334833119503608630', fallback: '🏷' },
    type:      { id: '5335035180535012832', fallback: '🧩' },
    mode:      { id: '5335014599051731395', fallback: '⚙️' },
    online:    { id: '5334950187427193501', fallback: '🟢' },
    locked:    { id: '5334699859553317341', fallback: '🔴' },
  },
  loading:     { id: '5258077393884562645', fallback: '⏳' }, 
  spare: [
    '5334779290678487530', '5334776189712099556', '5334650536148888639',
    '5334783332242712876', '5335047975242589941', '5334604893531433375',
    '5332729191118957807', '5332374766122723402', '5334587309935324524',
    '5332332353320676077', '5332402026280153080', '5334875094218994793',
    '5335009887472612179', '5335013563964615620', '5334587022172513964',
    '5332473833838375262', '5334785750309298729', '5334560298885996429',
    '5334884740715537359', '5334981119781661415', '5334908294316190371',
    '5334982889308185021', '5334551936584676318', '5334812499365621269',
    '5334953863919202438', '5334549759036252964', '5334920204260502859',
    '5334927883662027664', '5334844617131062652', '5332410882502715811',
    '5334827995607626405', '5334517478062060166', '5334785333697473617',
    '5334905747400584815', '5471874298874444328', '5465361436236593352',
    '5192661343999636786', '5458515524654741536', '5264733609645847811',
    '5247184106986421184', '5192953324466353290', '5296747484121413521',
    '5197564530204358227', '5219890182525826210', '5472190606035925661',
    '5224260659641857816', '5285503470193884320', '5458655476164083233',
    '5206372206753365123', '5285459717362038704', '5210676300854866299',
    '5215537911776164162', '5201786075034433235', '5199580897090743967',
    '5301076613587286086', '5246745015299884197', '5285535716808342592',
    '5195362844069085267', '5197155404504642051', '5197272562622544064',
    '5217848986433502482', '5222143468398196540', '5285469862074791448',
    '5255779869849041226', '5260433458324322750', '5260371447586502532',
    '5289959593252765008', '5240364622338340370', '5289930954410836372',
    '5199721960996615423', '5296234029371112372', '5251506428929130037',
    '5251392779799511102', '5224427772524376976',
  ],
};

function customEmoji(name, text, group = 'buttons') {
  const emoji = CUSTOM_EMOJI[group]?.[name];
  if (!emoji?.id) return `${emoji?.fallback || ''}${text}`;
  return [
    { type: 'custom_emoji', custom_emoji_id: emoji.id, alternative_text: emoji.fallback || '' },
    text,
  ];
}

// ============================================================
// DESIGN LAYER
// ============================================================
function buildCell(text, options = {}) {
  const value = Array.isArray(text) ? text : String(text);
  return { text: value, align: 'left', valign: 'middle', ...options };
}

function buildTable(headers, rows, cellStyle = {}) {
  const headerCells = headers.map((t) =>
    buildCell(t, { is_header: true, align: 'center', valign: 'middle' }),
  );
  const rowCells = rows.map((row) =>
    row.map((v) =>
      buildCell(v, {
        align: cellStyle.align || 'left',
        valign: cellStyle.valign || 'middle',
      }),
    ),
  );
  return { cells: [headerCells, ...rowCells], type: 'table', is_bordered: true, is_striped: true };
}

function buildButtonBlock(buttons) {
  return {
    type: 'buttons',
    buttons: buttons.map((b) => ({
      text: b.text,
      style: b.style || 'danger',
      callback_data: b.callback_data,
      url: b.url,
    })),
  };
}

function footerBlock(extraNote) {
  const text = [{ type: 'bold', text: '\n' }, ` \n- ${botName}`];
  if (extraNote) text.push('\n', { type: 'italic', text: extraNote });
  return { type: 'footer', text };
}

function buildMenuMediaBlock() {
  if (!MENU_MEDIA_URL) return null;
  const type = MENU_MEDIA_TYPE === 'photo' ? 'photo' : 'video';
  return { type, [type]: { type, media: MENU_MEDIA_URL } };
}

// ============================================================
// RICH MESSAGE DELIVERY
// ============================================================
let richUnsupported = false;

async function streamBlocks(ctx, blocks, options = {}) {
  const {
    reply_markup,
    totalDurationMs = 1000,
    maxSteps = 2,
    footerNote,
    footer = true,
    edit = false,
  } = options;

  const payload = footer ? [...blocks, footerBlock(footerNote)] : blocks;
  const chatId = ctx.chat.id;
  const isPrivate = ctx.chat?.type === 'private';

  if (!richUnsupported && isPrivate && payload.length > 1) {
    const draftId = Date.now();
    try {
      // Yahan text hata kar sirf premium emoji load animation lagaya hai
      await bot.telegram.callApi('sendRichMessageDraft', {
        chat_id: chatId,
        draft_id: draftId,
        rich_message: { 
          blocks: [{ 
            type: 'paragraph', 
            text: [{ type: 'custom_emoji', custom_emoji_id: CUSTOM_EMOJI.loading.id, alternative_text: CUSTOM_EMOJI.loading.fallback }] 
          }] 
        },
      });
      await sleep(600);

      const steps = Math.min(maxSteps, payload.length);
      const chunkSize = Math.max(1, Math.ceil(payload.length / steps));
      const stepDelay = Math.floor(totalDurationMs / steps);

      for (let i = chunkSize; i < payload.length; i += chunkSize) {
        await bot.telegram.callApi('sendRichMessageDraft', {
          chat_id: chatId,
          draft_id: draftId,
          rich_message: { blocks: payload.slice(0, i) },
        });
        await sleep(stepDelay);
      }

      return await bot.telegram.callApi('sendRichMessage', {
        chat_id: chatId,
        rich_message: { blocks: payload },
        ...(reply_markup ? { reply_markup } : {}),
      });
    } catch (err) {
      richUnsupported = true;
      const reason = err?.description || err?.message || String(err);
      console.warn(`[rich] sendRichMessage unavailable (${reason}). Falling back to plain text.`);
    }
  }

  const text = renderBlocksToText(payload) || '…';
  const keyboard = reply_markup || renderBlocksToKeyboard(payload);
  if (edit && ctx.callbackQuery) {
    return ctx.editMessageText(text, { ...(keyboard || {}) }).catch(() =>
      ctx.reply(text, { ...(keyboard || {}) }),
    );
  }
  return ctx.reply(text, { ...(keyboard || {}) });
}

function segmentText(value) {
  if (Array.isArray(value)) {
    return value.map((seg) => (typeof seg === 'string' ? seg : (seg.alternative_text || ''))).join('');
  }
  return String(value ?? '');
}
function renderBlocksToText(blocks, depth = 0) {
  const lines = [];
  const pad = '  '.repeat(depth);
  for (const block of blocks) {
    if (!block) continue;
    if (block.type === 'heading' || block.type === 'paragraph' || block.type === 'footer') {
      lines.push(`${pad}${segmentText(block.text)}`);
    } else if (block.type === 'divider') {
      lines.push(`${pad}────────────`);
    } else if (block.type === 'table' && Array.isArray(block.cells)) {
      for (const row of block.cells) lines.push(`${pad}` + row.map((c) => segmentText(c.text)).join(' | '));
    } else if (block.type === 'details') {
      lines.push(`${pad}▸ ${segmentText(block.summary)}`);
      if (Array.isArray(block.blocks)) lines.push(renderBlocksToText(block.blocks, depth + 1));
    }
  }
  return lines.filter(Boolean).join('\n');
}
function renderBlocksToKeyboard(blocks) {
  const rows = [];
  for (const block of blocks) {
    if (block?.type === 'buttons' && Array.isArray(block.buttons)) {
      const row = [];
      for (const b of block.buttons) {
        if (b.url) row.push(Markup.button.url(segmentText(b.text), b.url));
        else if (b.callback_data) row.push(Markup.button.callback(segmentText(b.text), b.callback_data));
      }
      if (row.length) rows.push(row);
    }
  }
  return rows.length ? Markup.inlineKeyboard(rows) : undefined;
}

// ============================================================
// SHARED HELPERS
// ============================================================
function rowsToCells(rows) {
  return [
    [
      { text: customEmoji('status', 'Status', 'tables'), is_header: true, align: 'center', valign: 'middle' },
      { text: customEmoji('detail', 'Detail', 'tables'), is_header: true, align: 'center', valign: 'middle' },
    ],
    ...rows.map(([label, value]) => [
      { text: String(label), align: 'left', valign: 'middle' },
      { text: String(value), align: 'left', valign: 'middle' },
    ]),
  ];
}
async function sendTableMessage(ctx, title, cells, options = {}) {
  const blocks = [
    { type: 'heading', text: title, size: 1 },
    { type: 'table', cells, is_bordered: true, is_striped: true },
  ];
  return streamBlocks(ctx, blocks, {
    reply_markup: options.keyboard,
    edit: options.edit,
    footerNote: options.footerNote,
    footer: options.footer,
  });
}
function botReply(ctx, title, rows, keyboard = null) {
  return sendTableMessage(ctx, title, rowsToCells(rows), { keyboard });
}
function botError(ctx, reason, title = `${customEmoji('locked', 'Access Denied', 'headings')}`) {
  return botReply(ctx, title, [['Access', '❌ Denied'], ['Reason', reason]]);
}
function botSucces(ctx, detail, title = 'Status Success') {
  return botReply(ctx, title, [['Status', '✅ Successful'], ['Detail', detail]]);
}
function botList(ctx, title, items, emptyText = 'Empty') {
  if (!items.length) return botReply(ctx, title, [['Total', emptyText]]);
  return botReply(ctx, title, items.map((item, i) => [`#${i + 1}`, item]));
}

// ============================================================
// ORIGINAL LOGIC
// ============================================================
function userGuard(ctx, next) {
  if (ctx.from) store.upsertUser(ctx.from);
  if (isBanned(ctx)) return ctx.reply('🚫 Your account is blocked. Please contact the owner.');
  return next();
}
async function forceJoinStatus(ctx) {
  const channels = store.forceJoinChannels();
  const missing = [];
  for (const channel of channels) {
    try {
      const member = await ctx.telegram.getChatMember(channel.chatId, ctx.from.id);
      if (['left', 'kicked'].includes(member.status)) missing.push(channel);
    } catch (error) {
      console.error(`Force join check failed for ${channel.chatId}:`, error.message);
      missing.push(channel);
    }
  }
  return missing;
}
async function requireJoin(ctx) {
  const missing = await forceJoinStatus(ctx);
  if (!missing.length) return true;
  await sendForceJoin(ctx, missing);
  return false;
}
async function safeCopyToUser(userId, fromChatId, messageId) {
  try {
    await bot.telegram.copyMessage(userId, fromChatId, messageId);
    return true;
  } catch (error) {
    if ([400, 403].includes(error.response?.error_code)) return false;
    console.error('Broadcast copy failed:', error.message);
    return false;
  }
}
async function broadcastMessage(fromChatId, messageId) {
  let sent = 0; let failed = 0;
  for (const user of store.allUsers()) {
    if (user.banned) continue;
    if (await safeCopyToUser(user.id, fromChatId, messageId)) sent++; else failed++;
    await sleep(45);
  }
  return { sent, failed };
}

// ============================================================
// MENUS
// ============================================================
async function sendHome(ctx, edit = false) {
  const media = buildMenuMediaBlock();
  const blocks = [
    { type: 'heading', text: customEmoji('brand', botName, 'headings'), size: 1 },
    ...(media ? [media] : []),
    { type: 'heading', text: customEmoji('hello', `Hello ── ${ctx.from.first_name} ⋆𐙚`, 'headings'), size: 2 },
    { type: 'paragraph', text: 'Your premium APK destination is ready. Browse the verified catalog below.' },
    buildTable(
      [customEmoji('info', 'Information', 'tables'), customEmoji('detail', 'Details', 'tables')],
      [
        [customEmoji('creator', 'Creator', 'details'), ownerUsername ? `@${ownerUsername}` : '—'],
        [customEmoji('type', 'Type', 'details'), 'APK Store Bot'],
        [customEmoji('online', 'Status', 'details'), 'Online'],
      ],
    ),
    { type: 'divider' },
    buildButtonBlock([
      { text: customEmoji('browse', ' Browse APK Store', 'buttons'), style: 'success', callback_data: 'view_apks' },
      { text: customEmoji('contact', ' Contact Owner', 'buttons'), style: 'success', callback_data: 'owner_contact' },
    ]),
    ...(isAdmin(ctx)
      ? [buildButtonBlock([
          { text: customEmoji('admin', ' Admin Panel', 'buttons'), style: 'danger', callback_data: 'admin_panel' },
        ])]
      : []),
  ];
  return streamBlocks(ctx, blocks, { edit, footer: true });
}

async function sendApkCatalog(ctx, edit = false) {
  if (!(await requireJoin(ctx))) return;
  const apks = store.allApks();
  const media = buildMenuMediaBlock();
  const blocks = [
    { type: 'heading', text: customEmoji('brand', botName, 'headings'), size: 1 },
    ...(media ? [media] : []),
    { type: 'heading', text: customEmoji('storehead', 'APK Store', 'headings'), size: 2 },
    { type: 'paragraph', text: 'Select an app below to view details and download it.' },
    apks.length
      ? buildTable(
          [
            customEmoji('count', '#', 'tables'),
            customEmoji('title', 'Title', 'tables'),
            customEmoji('file', 'File', 'tables'),
          ],
          apks.map((apk, i) => [i + 1, apk.title, apk.fileName || 'APK']),
        )
      : buildTable(
          [customEmoji('status', 'Status', 'tables')],
          [[`${customEmoji('locked', 'The store is currently empty.', 'details')}`]],
        ),
  ];
  if (apks.length) {
    blocks.push(buildButtonBlock(
      apks.map((apk) => ({
        text: customEmoji('apk', ` ${apk.title}`, 'buttons'),
        style: 'danger',
        callback_data: `apk:${apk.id}`,
      })),
    ));
  }
  blocks.push(buildButtonBlock([
    { text: customEmoji('home', ' Main Menu', 'buttons'), style: 'danger', callback_data: 'main_menu' },
  ]));
  return streamBlocks(ctx, blocks, { edit, footer: true });
}

async function sendForceJoin(ctx, channels) {
  const media = buildMenuMediaBlock();
  const blocks = [
    { type: 'heading', text: customEmoji('brand', botName, 'headings'), size: 1 },
    ...(media ? [media] : []),
    { type: 'heading', text: customEmoji('locked', `Access Required ── ${ctx.from.first_name}`, 'headings'), size: 2 },
    buildTable(
      [customEmoji('status', 'Status', 'tables'), customEmoji('reason', 'Detail', 'tables')],
      [
        ['Access', '❌ Locked'],
        ['Reason', 'You must join all required channels'],
      ],
    ),
    buildButtonBlock(
      channels.map((c) => ({
        text: customEmoji('join', ` Join ${c.title}`, 'buttons'),
        style: 'success',
        url: c.invite,
      })),
    ),
    buildButtonBlock([
      { text: customEmoji('verify', ' I Have Joined — Verify', 'buttons'), style: 'success', callback_data: 'verify_join' },
    ]),
  ];
  return streamBlocks(ctx, blocks, { footer: true });
}

async function sendAdminPanel(ctx, edit = false) {
  const blocks = [
    { type: 'heading', text: customEmoji('adminhead', `${botName} Admin`, 'headings'), size: 1 },
    { type: 'paragraph', text: 'Choose an action below to manage your store.' },
    buildTable(
      [customEmoji('info', 'Info', 'tables'), customEmoji('value', 'Detail', 'tables')],
      [
        ['Users', String(store.allUsers().length)],
        ['APKs', String(store.allApks().length)],
        ['Force Join', String(store.forceJoinChannels().length)],
      ],
    ),
    { type: 'divider' },
    buildButtonBlock([
      { text: customEmoji('stats', ' Statistics', 'buttons'), style: 'success', callback_data: 'admin_stats' },
      { text: customEmoji('forcelist', ' Force Join List', 'buttons'), style: 'success', callback_data: 'admin_force_list' },
    ]),
    buildButtonBlock([
      { text: customEmoji('broadcast', ' Broadcast', 'buttons'), style: 'danger', callback_data: 'admin_broadcast' },
      { text: customEmoji('addapk', ' Add APK', 'buttons'), style: 'success', callback_data: 'admin_add_apk' },
    ]),
    buildButtonBlock([
      { text: customEmoji('delapk', ' Delete APK', 'buttons'), style: 'danger', callback_data: 'admin_delete_apk' },
      { text: customEmoji('addforce', ' Add Force Join', 'buttons'), style: 'success', callback_data: 'admin_add_force' },
    ]),
    buildButtonBlock([
      { text: customEmoji('delforce', ' Remove Force Join', 'buttons'), style: 'danger', callback_data: 'admin_delete_force' },
    ]),
    buildButtonBlock([
      { text: customEmoji('ban', ' Ban User', 'buttons'), style: 'danger', callback_data: 'admin_ban' },
      { text: customEmoji('unban', ' Unban User', 'buttons'), style: 'success', callback_data: 'admin_unban' },
    ]),
    buildButtonBlock([
      { text: customEmoji('home', ' Main Menu', 'buttons'), style: 'danger', callback_data: 'main_menu' },
    ]),
  ];
  return streamBlocks(ctx, blocks, { edit, footer: true });
}

async function sendAdminStats(ctx, edit = false) {
  const blocks = [
    { type: 'heading', text: customEmoji('statshead', 'Statistics', 'headings'), size: 1 },
    buildTable(
      [customEmoji('metric', 'Metric', 'tables'), customEmoji('value', 'Value', 'tables')],
      [
        ['Users', String(store.allUsers().length)],
        ['APKs', String(store.allApks().length)],
        ['Force Join channels', String(store.forceJoinChannels().length)],
      ],
    ),
    buildButtonBlock([
      { text: customEmoji('back', ' Admin Panel', 'buttons'), style: 'danger', callback_data: 'admin_panel' },
    ]),
  ];
  return streamBlocks(ctx, blocks, { edit, footer: true });
}

async function sendAdminForceList(ctx, edit = false) {
  const channels = store.forceJoinChannels();
  const blocks = [
    { type: 'heading', text: customEmoji('forcehead', 'Force Join List', 'headings'), size: 1 },
    channels.length
      ? buildTable(
          [
            customEmoji('count', '#', 'tables'),
            customEmoji('title', 'Title', 'tables'),
            customEmoji('chatid', 'Chat ID', 'tables'),
          ],
          channels.map((c, i) => [i + 1, c.title, c.chatId]),
        )
      : buildTable(
          [customEmoji('status', 'Status', 'tables')],
          [['No force-join channels configured.']],
        ),
    buildButtonBlock([
      { text: customEmoji('back', ' Admin Panel', 'buttons'), style: 'danger', callback_data: 'admin_panel' },
    ]),
  ];
  return streamBlocks(ctx, blocks, { edit, footer: true });
}

// ============================================================
// BOT WIRING
// ============================================================
bot.use(session());
bot.use(userGuard);

bot.start(async (ctx) => {
  if (!(await requireJoin(ctx))) return;
  await sendHome(ctx);
});

bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('⛔ This command is available to the owner only.');
  return sendAdminPanel(ctx);
});

bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx)) return;
  if (!ctx.message.reply_to_message) return ctx.reply('Reply to a message and send /broadcast to distribute it.');
  const status = await ctx.reply('📢 Broadcast started...');
  const result = await broadcastMessage(ctx.chat.id, ctx.message.reply_to_message.message_id);
  return ctx.telegram.editMessageText(
    ctx.chat.id, status.message_id, undefined,
    `✅ Broadcast complete\n\nDelivered: ${result.sent}\nFailed/blocked: ${result.failed}`,
  );
});

bot.action('main_menu', async (ctx) => { await ctx.answerCbQuery(); if (!(await requireJoin(ctx))) return; return sendHome(ctx, true); });
bot.action('verify_join', async (ctx) => { await ctx.answerCbQuery('Checking membership...'); if (!(await requireJoin(ctx))) return; return sendHome(ctx, true); });
bot.action('view_apks', async (ctx) => { await ctx.answerCbQuery(); return sendApkCatalog(ctx, true); });

bot.action('owner_contact', async (ctx) => {
  await ctx.answerCbQuery();
  const contact = ownerUsername ? `https://t.me/${ownerUsername}` : `tg://user?id=${ownerId}`;
  const blocks = [
    { type: 'heading', text: customEmoji('contacth', 'Owner Contact', 'headings'), size: 1 },
    { type: 'paragraph', text: 'Contact the owner for support, requests or partnerships.' },
    buildButtonBlock([
      { text: customEmoji('contact', ' Contact Owner', 'buttons'), style: 'success', url: contact },
    ]),
    buildButtonBlock([
      { text: customEmoji('home', ' Main Menu', 'buttons'), style: 'danger', callback_data: 'main_menu' },
    ]),
  ];
  return streamBlocks(ctx, blocks, { edit: true, footer: true });
});

bot.action(/^apk:(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  if (!(await requireJoin(ctx))) return;
  const apk = store.getApk(ctx.match[1]);
  if (!apk) return ctx.reply('This APK is no longer available.', backToHome());
  const caption = `📱 <b>${escapeHtml(apk.title)}</b>\n\n${escapeHtml(apk.description || 'No description provided.')}\n\n📄 ${escapeHtml(apk.fileName || 'APK file')}`;
  return ctx.replyWithDocument(apk.fileId, {
    caption, parse_mode: 'HTML',
    ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Store', 'view_apks')]]),
  });
});

bot.action('admin_panel', async (ctx) => { if (!isAdmin(ctx)) return; await ctx.answerCbQuery(); return sendAdminPanel(ctx, true); });
bot.action('admin_stats', async (ctx) => { if (!isAdmin(ctx)) return; await ctx.answerCbQuery(); return sendAdminStats(ctx, true); });
bot.action('admin_force_list', async (ctx) => { if (!isAdmin(ctx)) return; await ctx.answerCbQuery(); return sendAdminForceList(ctx, true); });

bot.action('admin_broadcast', async (ctx) => {
  if (!isAdmin(ctx)) return; await ctx.answerCbQuery();
  ctx.session = ctx.session || {};
  ctx.session.step = 'broadcast_prompt';
  return ctx.reply('📢 Reply to this prompt with the message you want to broadcast.\n\nText, photos, videos, documents, voice messages and premium emoji formatting will be copied as-is.\nSend /cancel to stop.');
});
bot.action('admin_add_apk', async (ctx) => {
  if (!isAdmin(ctx)) return; await ctx.answerCbQuery();
  ctx.session = ctx.session || {};
  ctx.session.step = 'apk_file';
  return ctx.reply('➕ Upload the APK as a Telegram document.\n\nSend /cancel to stop.');
});
bot.action('admin_delete_apk', async (ctx) => {
  if (!isAdmin(ctx)) return; await ctx.answerCbQuery();
  const apks = store.allApks();
  if (!apks.length) return ctx.reply('There are no APKs to remove.');
  return ctx.reply(
    '🗑 Select an APK to remove:',
    Markup.inlineKeyboard(
      apks.map((a) => [Markup.button.callback(`🗑 ${a.id} — ${a.title}`, `delete_apk:${a.id}`)])
        .concat([[Markup.button.callback('⬅️ Admin Panel', 'admin_panel')]]),
    ),
  );
});
bot.action(/^delete_apk:(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx)) return;
  const apk = store.getApk(ctx.match[1]);
  store.deleteApk(ctx.match[1]);
  await ctx.answerCbQuery('Deleted');
  return ctx.editMessageText(`✅ Deleted: ${apk?.title || 'APK'}`, backToAdmin());
});
bot.action('admin_add_force', async (ctx) => {
  if (!isAdmin(ctx)) return; await ctx.answerCbQuery();
  ctx.session = ctx.session || {};
  ctx.session.step = 'force_add';
  return ctx.reply('🔗 Send the channel details in this format:\n`chat_id | join_link | channel_title`\n\nExample: `-1001234567890 | https://t.me/+abc123 | My Updates Channel`', { parse_mode: 'Markdown' });
});
bot.action('admin_delete_force', async (ctx) => {
  if (!isAdmin(ctx)) return; await ctx.answerCbQuery();
  ctx.session = ctx.session || {};
  ctx.session.step = 'force_delete';
  return ctx.reply('Send the chat ID of the force-join channel to remove.');
});
bot.action('admin_ban', async (ctx) => {
  if (!isAdmin(ctx)) return; await ctx.answerCbQuery();
  ctx.session = ctx.session || {};
  ctx.session.step = 'ban_user';
  return ctx.reply('Send the numeric Telegram ID of the user to ban.');
});
bot.action('admin_unban', async (ctx) => {
  if (!isAdmin(ctx)) return; await ctx.answerCbQuery();
  ctx.session = ctx.session || {};
  ctx.session.step = 'unban_user';
  return ctx.reply('Send the numeric Telegram ID of the user to unban.');
});

bot.command('cancel', async (ctx) => {
  if (!isAdmin(ctx)) return;
  ctx.session = ctx.session || {};
  ctx.session.step = undefined;
  return ctx.reply('Cancelled.', backToAdmin());
});

bot.on('message', async (ctx, next) => {
  if (!isAdmin(ctx) || !ctx.session?.step) return next();
  const step = ctx.session.step;

  if (step === 'broadcast_prompt') {
    ctx.session.step = undefined;
    const status = await ctx.reply('📢 Broadcast started...');
    const result = await broadcastMessage(ctx.chat.id, ctx.message.message_id);
    return ctx.telegram.editMessageText(
      ctx.chat.id, status.message_id, undefined,
      `✅ Broadcast complete\n\nDelivered: ${result.sent}\nFailed/blocked: ${result.failed}`,
      backToAdmin(),
    );
  }
  if (step === 'apk_file') {
    if (!ctx.message.document) return ctx.reply('Please upload the APK as a Telegram document.');
    ctx.session.pendingApk = {
      fileId: ctx.message.document.file_id,
      fileName: ctx.message.document.file_name,
      mimeType: ctx.message.document.mime_type,
      size: ctx.message.document.file_size,
    };
    ctx.session.step = 'apk_title';
    return ctx.reply('Send the APK display name. This is the name users will see in the store.');
  }
  if (step === 'apk_title') {
    ctx.session.pendingApk.title = ctx.message.text?.trim();
    ctx.session.step = 'apk_description';
    return ctx.reply('Send a short description, or type `skip` to leave it empty.');
  }
  if (step === 'apk_description') {
    const pending = ctx.session.pendingApk;
    pending.description = ctx.message.text?.trim().toLowerCase() === 'skip' ? '' : ctx.message.text?.trim();
    const apk = store.addApk({ ...pending, addedBy: ctx.from.id });
    ctx.session.pendingApk = undefined;
    ctx.session.step = undefined;
    const notice = `🆕 *New APK Added*\n\n📱 ${apk.title}\n${apk.description || ''}`;
    let sent = 0;
    for (const user of store.allUsers()) {
      if (!user.banned) {
        try {
          await bot.telegram.sendMessage(user.id, notice, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('📥 View & Download', `apk:${apk.id}`)]]),
          });
          sent++;
        } catch (_) {}
      }
    }
    return ctx.reply(`✅ APK added and ${sent} users notified.`, backToAdmin());
  }
  if (step === 'force_add') {
    const parts = (ctx.message.text || '').split('|').map((x) => x.trim());
    if (parts.length < 3) return ctx.reply('Invalid format. Use: chat_id | join_link | title');
    store.addForceJoin({ chatId: parts[0], invite: parts[1], title: parts.slice(2).join(' | ') });
    ctx.session.step = undefined;
    return ctx.reply('✅ Force-join channel added. Make sure the bot is an administrator in that channel.', backToAdmin());
  }
  if (step === 'force_delete') {
    store.removeForceJoin((ctx.message.text || '').trim());
    ctx.session.step = undefined;
    return ctx.reply('✅ Force Join channel removed.', backToAdmin());
  }
  if (step === 'ban_user' || step === 'unban_user') {
    const id = Number((ctx.message.text || '').trim());
    if (!id) return ctx.reply('Please send a valid numeric Telegram ID.');
    store.setBanned(id, step === 'ban_user');
    ctx.session.step = undefined;
    return ctx.reply(`✅ User ${id} has been ${step === 'ban_user' ? 'banned' : 'unbanned'}.`, backToAdmin());
  }
  return next();
});

bot.catch((error) => console.error('Bot error:', error));
bot.launch().then(() => console.log(`${botName} started successfully.`));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
