# Cyrus Log Bot

Kapsamli olay loglayan, her log turunu ayri kanala atan ve ses kanalinda kulakligi kapali bekleyen `discord.js` botudur.

## Log Kanallari

- `MEMBER_LOG_CHANNEL_ID`: uye giris, cikis, avatar, ad, takma ad, rol degisimleri
- `MESSAGE_LOG_CHANNEL_ID`: mesaj silme, duzenleme, toplu silme, komut kullanimi
- `MODERATION_LOG_CHANNEL_ID`: ban, unban, kick, timeout, yetki yukseltme
- `GUILD_LOG_CHANNEL_ID`: kanal, rol, webhook, davet ve sunucu ayarlari
- `VOICE_LOG_CHANNEL_ID`: ses giris, cikis, tasinma, mute, deafen
- `SYSTEM_LOG_CHANNEL_ID`: bot acilis, hata, ses baglanti problemleri

## Kurulum

1. `npm install`
2. `.env.example` dosyasini `.env` olarak kopyala
3. `.env` icini doldur
4. `npm start`

## .env Ornegi

```env
DISCORD_TOKEN=buraya_bot_tokeni
VOICE_CHANNEL_ID=buraya_ses_kanali_id
MEMBER_LOG_CHANNEL_ID=uye_log_kanal_id
MESSAGE_LOG_CHANNEL_ID=mesaj_log_kanal_id
MODERATION_LOG_CHANNEL_ID=moderasyon_log_kanal_id
GUILD_LOG_CHANNEL_ID=kanal_rol_sunucu_log_kanal_id
VOICE_LOG_CHANNEL_ID=ses_log_kanal_id
SYSTEM_LOG_CHANNEL_ID=sistem_log_kanal_id
STATUS_TEXT=Developed By Cyrus
```

## Railway Notu

Kod artik ayarlari `.env` isimleriyle yonetiyor. Ama Railway uzerinde calisacaksa yerel `.env` dosyan otomatik gitmez. Bu nedenle Railway panelindeki `Variables` kismina ayni anahtarlari girmelisin. Yani kontrol yapisi `.env` tabanli, Railway sadece bu degiskenleri barindiriyor.

## Gerekli Izinler

- View Channels
- Send Messages
- Embed Links
- Read Message History
- View Audit Log
- Connect

## Not

Mesaj silme ve duzenleme olaylarinda Discord cache sinirlari nedeniyle bazen eksik icerik gelebilir. Audit log verileri de bazen birkac saniye gecikmeli dusebilir.
