import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import path from 'path'

console.log('🔥 WADI-BOT V3 - Cargando juegos...')

const plugins = new Map()
function loadPlugins(dir){
  if(!fs.existsSync(dir)) return
  for(const file of fs.readdirSync(dir)){
    const full = path.join(dir, file)
    if(fs.statSync(full).isDirectory()){ loadPlugins(full); continue }
    if(!file.endsWith('.js')) continue
    import(full).then(m=>{
      const cmds = m.command || [file.replace('.js','')]
      plugins.set(cmds[0].toLowerCase(), m.default)
      console.log(`✅ ${file} -> ${cmds}`)
    })
  }
}
loadPlugins('./plugins')

async function start(){
const { state, saveCreds } = await useMultiFileAuthState('./session')
const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), browser: ['WADI-BOT','Chrome','1.0'] })
sock.ev.on('creds.update', saveCreds)
sock.ev.on('connection.update', async (u)=>{
if(u.qr){ qrcode.generate(u.qr, { small: true }) }
if(u.connection==='open') console.log('✅ CONECTADO')
if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) start()
})
sock.ev.on('messages.upsert', async ({messages})=>{
const msg = messages[0]
if(!msg.message) return
const jid = msg.key.remoteJid
let txt = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
if(!txt.startsWith('#') &&!txt.startsWith('.')) return
const cmd = txt.slice(1).split(' ')[0].toLowerCase()
const args = txt.slice(1).split(/ +/).slice(1)
if(plugins.has(cmd)){
  await plugins.get(cmd)(sock, msg, { jid, args })
}
if(cmd==='ping') await sock.sendMessage(jid, { text: '🏓 PONG!' }, { quoted: msg })
})
}
start()
