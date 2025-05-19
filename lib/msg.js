/*
██╗███████╗██╗░░░██╗███╗░░░███╗██╗
██║╚════██║██║░░░██║████╗░████║██║
██║░░███╔═╝██║░░░██║██╔████╔██║██║
██║██╔══╝░░██║░░░██║██║╚██╔╝██║██║
██║███████╗╚██████╔╝██║░╚═╝░██║██║
╚═╝╚══════╝░╚═════╝░╚═╝░░░░░╚═╝╚═╝
Copyright © 2024 - 2025 Naruya Izumi
*/

const { proto, getContentType } = require("baileys")

function smsg(conn, m, store) {
if (!m) return m
let M = proto.WebMessageInfo
if (m.key) {
m.id = m.key.id
m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
m.chat = m.key.remoteJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat.endsWith('@g.us')
m.sender = conn.decodeJid(m.fromMe ? conn.user.id : (m.participant || m.key.participant || m.chat || ''))
if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || ''
}
if (m.message) {
m.mtype = getContentType(m.message)
m.msg = (m.mtype == 'viewOnceMessage'
? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
: m.message[m.mtype])
m.body = m.message.conversation || m.msg.caption || m.msg.text || m.msg.selectedButtonId || m.msg.singleSelectReply?.selectedRowId || m.text
let quoted = m.quoted = m.msg.contextInfo?.quotedMessage || null
m.mentionedJid = m.msg.contextInfo?.mentionedJid || []
if (quoted) {
let type = getContentType(quoted)
m.quoted = quoted[type]
if (['productMessage'].includes(type)) {
type = getContentType(m.quoted)
m.quoted = m.quoted[type]
}
if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
m.quoted.mtype = type
m.quoted.id = m.msg.contextInfo.stanzaId
m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id)
m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
m.getQuotedMessage = async () => {
if (!m.quoted.id) return null
let q = await store.loadMessage(m.chat, m.quoted.id)
return smsg(conn, q, store)
}
let vM = m.quoted.fakeObj = M.fromObject({
key: { remoteJid: m.quoted.chat, fromMe: m.quoted.fromMe, id: m.quoted.id },
message: quoted,
...(m.isGroup ? { participant: m.quoted.sender } : {})
})
m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key })
m.quoted.copyNForward = (jid, force = false, opt = {}) => conn.copyNForward(jid, vM, force, opt)
m.quoted.download = () => conn.downloadMediaMessage(m.quoted)
}
}
if (m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg)
m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
m.reply = (text, chatId = m.chat, options = {}) =>
Buffer.isBuffer(text)
? conn.sendMedia(chatId, text, 'file', '', m, options)
: conn.sendText(chatId, text, m, options)
m.copy = () => smsg(conn, M.fromObject(M.toObject(m)))
m.copyNForward = (jid = m.chat, force = false, opt = {}) => conn.copyNForward(jid, m, force, opt)
return m
}

function serialize(conn, m, store) {
if (!m) return m
m = smsg(conn, m, store)
if (!m) return m
m.downloadMsg = async () => {
if (!m.message) return null
let type = getContentType(m.message)
if (type === 'ephemeralMessage') type = getContentType(m.message.ephemeralMessage.message)
return await conn.downloadMediaMessage(m.msg)
}
m.react = async (emoji) => {
return await conn.sendMessage(m.chat, {
react: {
text: emoji,
key: m.key
}
})
}
m.send = (text, opt = {}) => conn.sendText(m.chat, text, m, opt)
m.reply = (text, opt = {}) => conn.sendText(m.chat, text, m, opt)
m.sendImage = async (buffer, caption = '', opt = {}) => conn.sendMessage(m.chat, {
image: buffer,
caption,
...opt
}, { quoted: m })
m.sendFile = async (buffer, filename = 'file', mimetype = '', opt = {}) => conn.sendMessage(m.chat, {
document: buffer,
fileName: filename,
mimetype,
...opt
}, { quoted: m })

return m
}

module.exports = {
smsg,
serialize
}