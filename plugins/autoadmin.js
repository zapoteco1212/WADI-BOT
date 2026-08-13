let handler = async (m, { conn, isBotAdmin }) => {
if (!isBotAdmin) return m.reply('💮 Necesito ser admin primero para hacerme auto-admin')
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
m.reply('💮 *Listo, te di admin* 🌊')
}
handler.help = ['autoadmin']
handler.tags = ['group']
handler.command = ['autoadmin', 'autoa']
handler.group = true
handler.botAdmin = true
module.exports = handler
