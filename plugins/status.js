let handler = async (m, { conn }) => {
let uptime = process.uptime()
let hours = Math.floor(uptime / 3600)
let minutes = Math.floor((uptime % 3600) / 60)
let os = require('os')

let txt = `💮 *STATUS - WADI-BOT v3.0*

*⏰ Activo:* ${hours}h ${minutes}m
*💾 RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${Math.round(os.totalmem() / 1024 / 1024)} MB
*📱 Plataforma:* ${os.platform()}
*👑 Creador:* zapoteco1212

✅ Bot funcionando correctamente`

conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}
handler.help = ['status', 'estado', 'info']
handler.tags = ['info']
handler.command = ['status', 'estado', 'info', 'infobot']
module.exports = handler
