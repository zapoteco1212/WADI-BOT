let handler = async (m, { conn }) => {
let texto = `
╭─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─╮
│  💮 WADI-BOT v3.0 🌊
╰─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─╯

╭───『 👑 INFO 』───╮
│ 
╰───────────────╯

╭───『 👥 GRUPOS 』───╮
│ 
╰───────────────╯

╭───『 🔒 OWNER 』───╮
│ 
╰───────────────╯

> 💮 WADI-BOT v3.0 - by zapoteco1212 🌊
`.trim()

await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}

handler.help = ['menu', 'help', 'wadi']
handler.tags = ['main']
handler.command = ['menu', 'help', 'wadi', 'comandos']
export default handler
