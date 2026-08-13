// AQUÍ PONES TODOS LOS OWNERS CON PODERES
global.owner = [
  ['527444200627', 'zapoteco1212 👑', true],
  ['52XXXXXXXXXX', 'Owner 2', true], // segundo
  ['52XXXXXXXXXX', 'Owner 3', true]  // tercero
]

let handler = async (m, { conn }) => {
let texto = `💮 *OWNERS - WADI-BOT v3.0*\n\n`
for (let [num, nombre] of global.owner) {
texto += `👑 ${nombre}\n📱 wa.me/${num}\n\n`
}
await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}
handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creador', 'dueño']
module.exports = handler
