let handler = async (m, { conn }) => {
let start = new Date().getTime()
let { key } = await conn.sendMessage(m.chat, {text: '🏓 Ping...'})
let end = new Date().getTime()
let speed = end - start
await conn.sendMessage(m.chat, {text: `💮 *PONG!*\n\n*Velocidad:* ${speed}ms\n*Bot:* WADI-BOT v3.0`, edit: key})
}
handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']
module.exports = handler
