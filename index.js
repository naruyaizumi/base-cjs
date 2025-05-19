/*
██╗███████╗██╗░░░██╗███╗░░░███╗██╗
██║╚════██║██║░░░██║████╗░████║██║
██║░░███╔═╝██║░░░██║██╔████╔██║██║
██║██╔══╝░░██║░░░██║██║╚██╔╝██║██║
██║███████╗╚██████╔╝██║░╚═╝░██║██║
╚═╝╚══════╝░╚═════╝░╚═╝░░░░░╚═╝╚═╝
Copyright © 2024 - 2025 Naruya Izumi
*/

const {
makeWASocket,
jidDecode,
proto,
getContentType,
makeInMemoryStore,
useMultiFileAuthState,
fetchLatestBaileysVersion,
Browsers
} = require("baileys")
const pino = require("pino")
const readline = require("readline")
const FileType = require("file-type")
const { smsg, serialize } = require("./lib/msg")

const question = (text) => {
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
return new Promise((resolve) => rl.question(text, resolve))
}
const store = makeInMemoryStore({ logger: pino().child({ level: "fatal" }) })

async function startBase() {
const { state, saveCreds } = await useMultiFileAuthState("session")
const { version: baileysVersion } = await fetchLatestBaileysVersion()
const conn = makeWASocket({
version: baileysVersion,
browser: Browsers.ubuntu('Safari'),
printQRInTerminal: false,
markOnlineOnConnect: true,
logger: pino({ level: 'silent' }),
auth: state
})
if (!conn.authState.creds.registered) {
console.log("Masukkan nomor telepon (cth: 62xxx)")
const phoneNumber = await question("PHONE: ")
const code = await conn.requestPairingCode(phoneNumber)
console.log(`PAIRING CODE: ${code}`)
}
conn.ev.on("creds.update", saveCreds)
store.bind(conn.ev)
conn.public = true
conn.ev.on("connection.update", async ({ connection }) => {
if (connection === "open") console.log("Terhubung")
if (connection === "close") await startBase()
})
conn.ev.on('messages.upsert', async chatUpdate => {
try {
let msg = chatUpdate.messages[0]
if (!msg.message) return
msg.message = Object.keys(msg.message)[0] === 'ephemeralMessage' ? msg.message.ephemeralMessage.message : msg.message
if (msg.key?.remoteJid === 'status@broadcast') return
if (!conn.public && !msg.key.fromMe && chatUpdate.type === 'notify') return
if (msg.key?.id?.startsWith('BAE5') && msg.key.id.length === 16) return
let m = smsg(conn, msg, store)
serialize(m)
require("./handler")(conn, m, chatUpdate, store)
} catch (err) {
console.log(err)
}
})
conn.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server ? decode.user + '@' + decode.server : jid
} else return jid
}
conn.sendText = (jid, text, quoted = '', options = {}) => conn.sendMessage(jid, { text, ...options }, { quoted })
conn.sendMedia = async function (jid, buffer, filename, caption = '', quoted = null, options = {}) {
let type = await FileType.fromBuffer(buffer) || { mime: 'application/octet-stream' }
return conn.sendMessage(jid, { document: buffer, mimetype: type.mime, fileName: filename, caption, ...options }, { quoted })
}
}

startBase()