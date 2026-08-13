let handler = async (m, { conn }) => {
let owners = [
  '527444200627',
  '52XXXXXXXXXX', // <- aquí agregas el segundo
  '52XXXXXXXXXX'  // <- aquí agregas el tercero
]

let texto = `💮 *OWNERS - WADI-BOT v3.0*\n\n`
for (let num of owners) {
texto += `👑 wa.me/${num}\n`
}
texto += `\nSi necesitas ayuda escribe.`

await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}
handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creador']
module.exports = handler
