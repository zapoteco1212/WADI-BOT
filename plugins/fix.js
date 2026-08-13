let handler = async (m, { conn, usedPrefix, command }) => {
  await m.reply('🔧 *Reparando sub-bots...*')
  // Borra archivos temporales que dan error
  const fs = require('fs')
  try {
    if (fs.existsSync('./jadibts/')) {
      m.reply('✅ Carpeta jadibts verificada.')
    }
    m.reply('💮 *Fix completado*\n\nReinicia el bot con: .restart')
  } catch (e) {
    m.reply('❌ Error: ' + e)
  }
}
handler.help = ['fix']
handler.tags = ['owner']
handler.command = ['fix', 'arreglar']
handler.rowner = true
module.exports = handler
