import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'

console.log('🔥 WADI-BOT V3 ULTRA-LIGERO - Node 26 Compatible')

async function start(){
const { state, saveCreds } = await useMultiFileAuthState('./session')
const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false, browser: ['WADI-BOT','Chrome','1.0'] })

sock.ev.on('creds.update', saveCreds)

sock.ev.on('connection.update', async (u)=>{
if(u.qr){ console.log('ESCANEA ESTE QR:'); qrcode.generate(u.qr, { small: true }) }
if(u.connection==='open'){ console.log('✅ CONECTADO WADI-BOT LISTO') }
if(u.connection==='close'){
  const c = u.lastDisconnect?.error?.output?.statusCode
  if(c!==DisconnectReason.loggedOut) start()
}
})

sock.ev.on('messages.upsert', async ({messages})=>{
const msg = messages[0]
if(!msg.message) return
const jid = msg.key.remoteJid
let txt = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ''
if(!txt) return
console.log(`Mensaje: ${txt}`)

const prefix = txt[0]
if(!['#','.','!','/'].includes(prefix)) return
const cmd = txt.slice(1).trim().split(' ')[0].toLowerCase()
const args = txt.slice(1).trim().split(/ +/).slice(1)
const text = args.join(' ')

if(['menu','help','comandos'].includes(cmd)){
  await sock.sendMessage(jid, { text: `*🔥 WADI-BOT V3 🔥*\n\n✅ Bot activo\n\n*COMANDOS:*\n#ping - Probar bot\n#menu - Este menu\n#sticker / #s - Hacer sticker\n#hidetag - Mencionar a todos\n#kick @ - Sacar\n#autoadmin - Hacer admin al bot\n#grupo abrir/cerrar\n#promote @ - Dar admin\n\nTu bot ya jala al 100%` }, { quoted: msg })
}
if(['ping','p'].includes(cmd)){
  await sock.sendMessage(jid, { text: `🏓 PONG! ${Date.now()}` }, { quoted: msg })
}
if(['s','sticker'].includes(cmd)){
  await sock.sendMessage(jid, { text: 'Manda una imagen con #s para hacer sticker (pronto)' }, { quoted: msg })
}
if(cmd==='autoadmin'){
  await sock.sendMessage(jid, { text: 'Si el bot es admin, puedo darte admin con #promote' }, { quoted: msg })
}
})
}
start()
