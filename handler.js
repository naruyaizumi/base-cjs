/*
██╗███████╗██╗░░░██╗███╗░░░███╗██╗
██║╚════██║██║░░░██║████╗░████║██║
██║░░███╔═╝██║░░░██║██╔████╔██║██║
██║██╔══╝░░██║░░░██║██║╚██╔╝██║██║
██║███████╗╚██████╔╝██║░╚═╝░██║██║
╚═╝╚══════╝░╚═════╝░╚═╝░░░░░╚═╝╚═╝
Copyright © 2024 - 2025 Naruya Izumi
*/
const config = require('./config')

async function handler(conn, m) {
try {
const body =
m.message?.conversation ||
m.message?.imageMessage?.caption ||
m.message?.documentMessage?.caption ||
m.message?.videoMessage?.caption ||
m.message?.extendedTextMessage?.text ||
m.message?.buttonsResponseMessage?.selectedButtonId ||
m.message?.templateButtonReplyMessage?.selectedId || ''
const budy = typeof m.text === 'string' ? m.text : ''
const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/
const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.'
const isCmd = body.startsWith(prefix)
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
const args = body.trim().split(/ +/).slice(1)
const text = args.join(" ")
const q = text
const sender = m.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (m.key.participant || m.key.remoteJid)
const senderNumber = sender.split('@')[0]
const botNumber = await conn.decodeJid(conn.user.id)
const isOwner = config.owner.includes(senderNumber)
switch (command) {
case 'ping': {
if (!isOwner) return m.reply("❌ Hanya owner!")
await m.reply("pong!")
}
break
default: {
if (isCmd) await m.reply('Perintah tidak dikenal.')
}
}
} catch (err) {
console.log(err)
}
}

module.exports = handler