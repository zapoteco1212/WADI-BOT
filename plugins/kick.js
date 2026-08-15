let handler = async (m, { conn, participants }) => {
let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : false
if (!who) return m.reply('💮 Etiqueta a la persona que quieres expulsar\n\nEjemplo:.kick @usuario')

if (who === conn.user.jid) return m.reply('💮 No puedo expulsarme a mi mismo 🌊')
try {
await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
await conn.sendMessage(m.chat, {
text: `💮 Usuario *@${who.split('@')[0]}* expulsado del grupo\n\n> Acción por: @${m.sender.split('@')[0]}\n> 💮 WADI-BOT v3.0 🌊`,
mentions: [who, m.sender]
}, { quoted: m })
} catch {
m.reply('✖️ No pude expulsarlo, quizá no soy admin')
}
}
handler.help = ['kick']
handler.tags = ['group']
handler.command = ['kick', 'expulsar', 'sacar']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler
