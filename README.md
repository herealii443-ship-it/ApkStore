# Epic APK Store Bot

एक premium, button-driven Telegram APK Store Bot built with Node.js + Telegraf. यह bot APK को Telegram `file_id` के रूप में store करता है, इसलिए server पर binary files रखने की जरूरत नहीं होती।

## Features

- `/start` पर Force Join gate और membership verification
- Verified users के लिए polished APK Store catalog
- APK details और one-tap download
- Button-based owner/admin panel
- Same-to-same broadcast via Telegram `copyMessage`
  - text, formatting, photos, videos, documents, voice और custom/premium emoji entities
- Add APK flow: upload document → title → description
- New APK add होते ही सभी active users को notification
- Force Join channels add/list/delete
- Ban/unban users
- User statistics
- Owner contact button
- Configurable Telegram custom/premium emoji entities in bot messages
- JSON persistence; external database की आवश्यकता नहीं

## Setup

1. Telegram में `@BotFather` से bot बनाकर token लें।
2. Owner का numeric Telegram ID पता करें (किसी ID bot से)।
3. Project folder में install करें:

```bash
npm install
cp .env.example .env
```

4. `.env` में values भरें:

```env
BOT_TOKEN=123456:your_bot_token
OWNER_ID=123456789
OWNER_USERNAME=your_username
BOT_NAME=Epic APK Store
DATA_FILE=./data/store.json

# Optional custom emoji IDs
EMOJI_BRAND=
EMOJI_STORE=
EMOJI_ADMIN=
EMOJI_APK=
EMOJI_BROADCAST=
EMOJI_FORCE_JOIN=
EMOJI_OWNER=
EMOJI_SUCCESS=
EMOJI_WARNING=
EMOJI_USERS=
```

Custom emoji IDs केवल Telegram के message entities में apply होते हैं। Inline keyboard button labels में Telegram custom emoji entities allow नहीं करता, इसलिए buttons में normal emoji fallback रखे गए हैं। अगर कोई ID blank हो तो bot automatically normal emoji इस्तेमाल करेगा।

5. Start करें:

```bash
npm start
```

Development में:

```bash
npm run dev
```

## Admin usage

- `/admin` भेजें और buttons से actions चुनें।
- Broadcast के लिए Admin Panel → Broadcast → जिस message को भेजना है उसे bot prompt के reply में भेजें। पुराने तरीके के लिए किसी message पर reply करके `/broadcast` भी भेज सकते हैं।
- Force Join channel जोड़ते समय bot को उस channel में admin बनाएं ताकि `getChatMember` membership check काम करे। Format:

```text
chat_id | join_link | channel_title
```

- APK को **Document** के रूप में upload करें। Bot file को Telegram `file_id` से save करेगा।

## Production notes

- `.env` कभी GitHub पर commit न करें।
- JSON data file का backup रखें; बड़े scale पर database adapter लगाना बेहतर होगा।
- Bot को हमेशा 24/7 process manager (PM2, Docker या systemd) के साथ चलाएं।
- Telegram privacy और copyright rules के अनुसार ही APK distribute करें।
