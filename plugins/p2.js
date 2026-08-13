let handler = async (m, { conn }) => {
await conn.sendMessage(m.chat, { text: '💮 *P2 - WADI-BOT v3.0*\n\nActivo bro ✅' }, { quoted: m })
}
handler.help = ['p2']
handler.tags = ['info']
handler.command = ['p2']
module.exports = handler
