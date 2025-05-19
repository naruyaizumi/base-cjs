# Base WhatsApp Bot - CJS

<p align="center">
  <img src="https://i.supa.codes/kyWCSZ" width="300" alt="Baileys WhatsApp API">
</p>

<p align="center">
  <b>Base Bot WhatsApp Multi-Device</b> berbasis <code>CommonJS</code> dan <code>Baileys (naruyaizumi)</code>.  
  Ringan, bersih, modular. Cocok untuk pemula maupun developer bot berpengalaman.
</p>

## 📦 Fitur Utama

- ✅ **Support Pairing Code** (tanpa scan QR lagi)
- ✅ Handler berbasis `messages.upsert`
- ✅ Fungsi `smsg()` dan `serialize()` siap pakai
- ✅ Command modular (`base`, `ping`)
- ✅ Format `CJS`
- ✅ Bot public / private ready
- ✅ Konfigurasi global lewat `config.js`
- ✅ Bisa di-host di VPS, panel, atau Termux

## ⚙️ Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/naruyaizumi/base-cjs
cd base-cjs
```

### 2. Install Dependency

```bash
npm install
```

### 3. Jalankan Bot

```bash
node index.js
```

Jika belum login, sistem akan meminta input nomor HP dan menampilkan kode pairing untuk login.

## 🔧 Konfigurasi `config.js`

```javascript
module.exports = {
  owner: ['628xxxxxx'], // Nomor Owner (bisa lebih dari satu)
}
```

## 📂 Struktur Direktori

```
base-cjs/
├── config.js               # Konfigurasi bot
├── index.js                # Entry point utama
├── lib/
│   └── msg.js              # smsg dan serialize
├── handler.js              # Command base dan ping
├── session/                # File autentikasi
└── package.json            # Dependensi dan metadata
```

## 🧠 Teknologi yang Digunakan

- [Baileys (naruyaizumi fork)](https://github.com/naruyaizumi/baileys) - WhatsApp Web API berbasis socket
- [Pino](https://github.com/pinojs/pino) - Logger minimalis
- [file-type](https://github.com/sindresorhus/file-type) - Deteksi MIME otomatis

## ✍️ Contoh Command

```javascript
// handler.js

switch (command) {
  case 'ping': {
    if (!isOwner) return m.reply("❌ Hanya owner!")
    await m.reply("pong!")
  }
  break
}
```

## ⭐ Credits

- [`naruyaizumi`](https://github.com/naruyaizumi) - Fork utama dan maintainer
- [`WhiskeySockets`](https://github.com/whiskeysockets/baileys) - Baileys Original
- Semua kontributor komunitas WhatsApp Dev

## ❤️ Support

Berikan ⭐ di repo ini jika membantu, atau bergabung ke grup diskusi WhatsApp:

> [𝗟𝗶𝗻𝗸 𝗖𝗵𝗮𝗻𝗻𝗲𝗹](https://whatsapp.com/channel/0029Vb5vz4oDjiOfUeW2Mt03)

> [𝗟𝗶𝗻𝗸 𝗚𝗿𝗼𝘂𝗽](https://chat.whatsapp.com/J9DANHhVooxDslMY6Emjhi()