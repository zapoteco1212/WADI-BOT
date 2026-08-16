import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import { loadPlugins } from './core/fix.js'

const plugins = loadPlugins()

async function start(){
const { state, saveCreds } = await useMultiFileAuthState('./session')
const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), browser: ['WADI-BOT','Chrome','1.0'] })
sock.ev.on('creds.update', saveCreds)
sock.ev.on('connection.update', u=>{
  if(u.qr) qrcode.generate(u.qr, {small:true})
  if(u.connection==='open') console.log('✅ CONECTADO |', [...plugins.keys()])
  if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) start()
})
sock.ev.on('messages.upsert', async ({messages})=>{
const msg = messages[0]; if(!msg.message) return
const txt = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
if(!txt.startsWith('#')) return
const cmd = txt.slice(1).split(' ')[0].toLowerCase()
if(plugins.has(cmd)) await plugins.get(cmd)(sock, msg, { jid: msg.key.remoteJid, args: txt.split(/ +/).slice(1) })
})
}
start()
