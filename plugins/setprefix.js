let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Ejemplo: ${usedPrefix + command} !`)
  global.prefix = text
  m.reply(`✅ Prefijo cambiado a: ${text}`)
}
handler.help = ['setprefix']
handler.tags = ['owner']
handler.command = ['setprefix', 'setprefijo']
handler.rowner = true
module.exports = handler
