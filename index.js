// WADI-BOT v2.0 - BY zapoteco1212 💮
// RPG + Economia + Juegos + Grupo + Code 10 Slots + setprefix multi

const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')
const qrcode = require('qrcode-terminal')
const fs = require('fs')

// Crear carpetas si no existen
if(!fs.existsSync('./database')) fs.mkdirSync('./database')
if(!fs.existsSync('./session')) fs.mkdirSync('./session')
if(!fs.existsSync('./codes')) fs.mkdirSync('./codes')

if(!fs.existsSync('./database/economia.json')) fs.writeFileSync('./database/economia.json','{}')
if(!fs.existsSync('./database/owners.json')) fs.writeFileSync('./database/owners.json','[]')
if(!fs.existsSync('./database/codes.json')) fs.writeFileSync('./database/codes.json','{"usados":0,"max":10,"lista":[]}')
if(!fs.existsSync('./database/prefixes.json')) fs.writeFileSync('./database/prefixes.json','["×",".","#","/"]')

let eco = JSON.parse(fs.readFileSync('./database/economia.json'))
let owners = JSON.parse(fs.readFileSync('./database/owners.json'))
let codes = JSON.parse(fs.readFileSync('./database/codes.json'))
let prefixes = JSON.parse(fs.readFileSync('./database/prefixes.json'))

const save = () => fs.writeFileSync('./database/economia.json', JSON.stringify(eco))
const saveOwners = () => fs.writeFileSync('./database/owners.json', JSON.stringify(owners))
const saveCodes = () => fs.writeFileSync('./database/codes.json', JSON.stringify(codes))
const savePref = () => fs.writeFileSync('./database/prefixes.json', JSON.stringify(prefixes))

function get(id){
  if(!eco[id]) eco[id]={coins:1000,xp:0,level:1,last:0}
  return eco[id]
}
function isOwner(id){ return owners.includes(id) || owners.length===0 }

async function start(){
const { state, saveCreds } = await useMultiFileAuthState('./session')
const sock = makeWASocket({ logger: P({level:'silent'}), auth: state })
sock.ev.on('creds.update', saveCreds)
sock.ev.on('connection.update', u=>{
  if(u.qr) qrcode.generate(u.qr,{small:true})
  if(u.connection==='open') console.log('WADI-BOT v2.0 ONLINE 💮')
  if(u.connection==='close') setTimeout(start,3000)
})

sock.ev.on('messages.upsert', async m=>{
try{
const msg=m.messages[0]; if(!msg.message) return
const txt=msg.message.conversation||msg.message.extendedTextMessage?.text||""
const from=msg.key.remoteJid
const sender=msg.key.participant||from
let mentioned=msg.message.extendedTextMessage?.contextInfo?.mentionedJid||[]
let target=mentioned[0]||null

let usedPrefix=null
for(let p of prefixes){ if(txt.startsWith(p)){ usedPrefix=p; break } }
if(!usedPrefix) return
const args=txt.slice(usedPrefix.length).trim().split(/ +/)
const cmd=args[0].toLowerCase()
const user=get(sender)

// MENU
if(cmd==='menu'){
let menu=`
╭─〔 *WADI-BOT* 💮 〕─
┃ By zapoteco1212
┃ @${sender.split('@')[0]}
┃ Coins: ${user.coins} | XP: ${user.xp} | Lv: ${user.level}
┃ Pref: ${prefixes.join(' ')}
╰───────────

💰 ECONOMIA
${usedPrefix}bal | ${usedPrefix}daily | ${usedPrefix}work
${usedPrefix}baltop | ${usedPrefix}top

⚔️ RPG
${usedPrefix}level | ${usedPrefix}aventura | ${usedPrefix}cazar
${usedPrefix}lb

🎰 JUEGOS
${usedPrefix}slot 100 | ${usedPrefix}dado | ${usedPrefix}cara
${usedPrefix}ppt piedra | ${usedPrefix}ruleta 100 | ${usedPrefix}bj 100

👑 GRUPO
${usedPrefix}ban @ | ${usedPrefix}promote @ | ${usedPrefix}demote @
${usedPrefix}link | ${usedPrefix}tagall

🔗 CODE 10
${usedPrefix}code 52xxx | ${usedPrefix}espacios | ${usedPrefix}resetcode

⚙️ OWNER
${usedPrefix}setprefix #/.,+† | ${usedPrefix}getprefix
${usedPrefix}addcoins @ 1000 | ${usedPrefix}givexp @ 100
${usedPrefix}reseteco | ${usedPrefix}resetxp | ${usedPrefix}resetall
${usedPrefix}dar owner 52xxx | ${usedPrefix}p
`.trim()
await sock.sendMessage(from,{text:menu, mentions:[sender]})
}

if(cmd==='bal'){ let id=target||sender; let u=get(id); await sock.sendMessage(from,{text:`💰 @${id.split('@')[0]}\nCoins: ${u.coins}\nXP: ${u.xp}\nLv: ${u.level}`, mentions:[id]}) }
if(cmd==='level'){ await sock.sendMessage(from,{text:`⚔️ @${sender.split('@')[0]}\nLv: ${user.level} | XP: ${user.xp}/${user.level*100}`, mentions:[sender]}) }
if(cmd==='lb'){ let top=Object.entries(eco).sort((a,b)=>(b[1].xp||0)-(a[1].xp||0)).slice(0,10); let t='🏆 *WADI LB XP*\n\n'; top.forEach(([id,d],i)=>{ t+=`${i==0?'🥇':i==1?'🥈':i==2?'🥉':`${i+1}.`} @${id.split('@')[0]} - Lv${d.level} ${d.xp}XP\n` }); await sock.sendMessage(from,{text:t, mentions:top.map(x=>x[0])}) }
if(cmd==='baltop'||cmd==='top'){ let top=Object.entries(eco).sort((a,b)=>(b[1].coins||0)-(a[1].coins||0)).slice(0,10); let t='💰 *WADI BALT0P*\n\n'; top.forEach(([id,d],i)=>{ t+=`${i==0?'🥇':i==1?'🥈':i==2?'🥉':`${i+1}.`} @${id.split('@')[0]} - ${d.coins} coins\n` }); await sock.sendMessage(from,{text:t, mentions:top.map(x=>x[0])}) }
if(cmd==='p'||cmd==='ping'){ let up=process.uptime(); await sock.sendMessage(from,{text:`✅ *WADI-BOT ACTIVA* 💮\n⏱️ ${Math.floor(up/60)}m\n👤 @${sender.split('@')[0]} | 💰${user.coins} XP:${user.xp}`, mentions:[sender]}) }

if(cmd==='daily'){ let now=Date.now(); if(now-user.last<86400000) return sock.sendMessage(from,{text:`Ya reclamaste`}); user.coins+=500; user.xp+=20; if(user.xp>=user.level*100){user.level++; user.xp=0} user.last=now; save(); await sock.sendMessage(from,{text:`+500 coins +20 xp Lv${user.level}`}) }
if(cmd==='work'){ user.coins+=100; user.xp+=10; if(user.xp>=user.level*100){user.level++; user.xp=0} save(); await sock.sendMessage(from,{text:`+100 coins +10 xp`}) }
if(cmd==='aventura'){ user.coins+=50; user.xp+=15; save(); await sock.sendMessage(from,{text:`⚔️ +50 coins +15 xp`}) }
if(cmd==='cazar'){ let g=Math.floor(Math.random()*100)+20; user.coins+=g; user.xp+=10; save(); await sock.sendMessage(from,{text:`🏹 +${g} coins +10 xp`}) }

if(cmd==='dado'){ await sock.sendMessage(from,{text:`🎲 Dado: ${Math.floor(Math.random()*6)+1}`}) }
if(cmd==='cara'){ await sock.sendMessage(from,{text:`🪙 ${Math.random()<0.5?'CARA':'CRUZ'}`}) }
if(cmd==='ppt'){ let op=(args[1]||'').toLowerCase(); let ops=['piedra','papel','tijera']; if(!ops.includes(op)) return sock.sendMessage(from,{text:`Usa: ${usedPrefix}ppt piedra`}); let bot=ops[Math.floor(Math.random()*3)]; let r=op===bot?'Empate':(op==='piedra'&&bot==='tijera')||(op==='papel'&&bot==='piedra')||(op==='tijera'&&bot==='papel')?'Ganaste +50':'Perdiste -20'; if(r.includes('Ganaste')){user.coins+=50; user.xp+=5} if(r.includes('Perdiste')) user.coins=Math.max(0,user.coins-20); save(); await sock.sendMessage(from,{text:`Tu:${op} Bot:${bot}\n${r}`}) }
if(cmd==='slot'){ let ap=parseInt(args[1])||100; if(user.coins<ap) return sock.sendMessage(from,{text:'Sin coins'}); let e=['🍒','🍋','💮','7️⃣']; let a=e[0|Math.random()*4],b=e[0|Math.random()*4],c=e[0|Math.random()*4]; if(a===b&&b===c){user.coins+=ap*3; await sock.sendMessage(from,{text:`${a}|${b}|${c} JACKPOT +${ap*3}`})} else{user.coins-=ap; await sock.sendMessage(from,{text:`${a}|${b}|${c} -${ap}`})} save() }
if(cmd==='ruleta'){ let ap=parseInt(args[1])||100; if(user.coins<ap) return; if(Math.random()<0.5){user.coins+=ap; await sock.sendMessage(from,{text:`🎰 GANASTE +${ap}`})} else{user.coins-=ap; await sock.sendMessage(from,{text:`🎰 PERDISTE -${ap}`})} save() }
if(cmd==='blackjack'||cmd==='bj'){ let ap=parseInt(args[1])||100; if(user.coins<ap) return; let u=Math.floor(Math.random()*11)+11, b=Math.floor(Math.random()*11)+11; if(u>b&&u<=21){user.coins+=ap; await sock.sendMessage(from,{text:`🃏 Tu ${u} vs ${b} GANASTE +${ap}`})} else if(u===b){await sock.sendMessage(from,{text:`🃏 ${u} vs ${b} EMPATE`})} else{user.coins-=ap; await sock.sendMessage(from,{text:`🃏 Tu ${u} vs ${b} PERDISTE -${ap}`})} save() }

if(cmd==='link'){ if(!from.endsWith('@g.us')) return; try{ let code=await sock.groupInviteCode(from); await sock.sendMessage(from,{text:`https://chat.whatsapp.com/${code}`}) }catch{ await sock.sendMessage(from,{text:'No soy admin'}) } }
if(cmd==='ban'||cmd==='kick'){ if(!from.endsWith('@g.us')||!target) return; try{ await sock.groupParticipantsUpdate(from,[target],'remove'); await sock.sendMessage(from,{text:`✅ Baneado @${target.split('@')[0]}`, mentions:[target]}) }catch{ await sock.sendMessage(from,{text:'No soy admin'}) } }
if(cmd==='promote'){ if(!from.endsWith('@g.us')||!target) return; try{ await sock.groupParticipantsUpdate(from,[target],'promote'); await sock.sendMessage(from,{text:`✅ Admin @${target.split('@')[0]}`, mentions:[target]}) }catch{} }
if(cmd==='demote'){ if(!from.endsWith('@g.us')||!target) return; try{ await sock.groupParticipantsUpdate(from,[target],'demote'); await sock.sendMessage(from,{text:`✅ Ya no admin @${target.split('@')[0]}`, mentions:[target]}) }catch{} }
if(cmd==='tagall'||cmd==='hidetag'){ if(!from.endsWith('@g.us')) return; let g=await sock.groupMetadata(from); let mems=g.participants.map(p=>p.id); await sock.sendMessage(from,{text:args.slice(1).join(' ')||'WADI-BOT 📢', mentions:mems}) }

if(cmd==='setprefix'){ if(owners.length>0&&!isOwner(sender)) return; let raw=args.slice(1).join(' ')||''; if(!raw) return sock.sendMessage(from,{text:`Usa: ${usedPrefix}setprefix #/.,+†\nActual: ${prefixes.join(' ')}`}); let list=[...new Set(raw.split('').filter(c=>c.trim()!==''))]; if(!list.includes('×')) list.unshift('×'); prefixes=list; savePref(); await sock.sendMessage(from,{text:`✅ Prefijos WADI: ${prefixes.join(' ')}`}) }
if(cmd==='getprefix'){ await sock.sendMessage(from,{text:`Prefijos: ${prefixes.join(' ')}`}) }

if(cmd==='dar'&&args[1]==='owner'){ let num=args[2]?.replace(/[^0-9]/g,''); if(!num) return; let nid=num+'@s.whatsapp.net'; if(owners.length===0){ owners.push(sender, nid); } else{ if(!isOwner(sender)) return; if(!owners.includes(nid)) owners.push(nid); } saveOwners(); await sock.sendMessage(from,{text:`✅ Owner WADI: ${num}`}) }
if(cmd==='addcoins'||cmd==='givecoins'){ if(owners.length>0&&!isOwner(sender)) return; let amt=parseInt(args[args.length-1]); if(!target) return; get(target).coins+=amt; save(); await sock.sendMessage(from,{text:`✅ +${amt} a @${target.split('@')[0]}`, mentions:[target]}) }
if(cmd==='givexp'){ if(owners.length>0&&!isOwner(sender)) return; let amt=parseInt(args[args.length-1]); if(!target) return; let u=get(target); u.xp+=amt; if(u.xp>=u.level*100){u.level++; u.xp=0} save(); await sock.sendMessage(from,{text:`✅ +${amt} XP @${target.split('@')[0]}`, mentions:[target]}) }
if(cmd==='reseteco'){ if(owners.length>0&&!isOwner(sender)) return; for(let id in eco) eco[id].coins=0; save(); await sock.sendMessage(from,{text:'✅ Economia 0'}) }
if(cmd==='resetxp'){ if(owners.length>0&&!isOwner(sender)) return; for(let id in eco){eco[id].xp=0; eco[id].level=1} save(); await sock.sendMessage(from,{text:'✅ XP Lv1 0'}) }
if(cmd==='resetall'){ if(owners.length>0&&!isOwner(sender)) return; for(let id in eco){eco[id].coins=0; eco[id].xp=0; eco[id].level=1; eco[id].last=0} save(); await sock.sendMessage(from,{text:'💥 RESET TOTAL WADI'}) }

if(cmd==='code'){ let num=args[1]?.replace(/[^0-9]/g,''); if(!num) return sock.sendMessage(from,{text:`Usa: ${usedPrefix}code 52xxx`}); if(codes.usados>=codes.max) return sock.sendMessage(from,{text:`❌ Sin espacios ${codes.usados}/${codes.max}`}); await sock.sendMessage(from,{text:`⏳ Generando WADI CODE ${num}...`}); try{ let dir='./codes/'+num; if(fs.existsSync(dir)) fs.rmSync(dir,{recursive:true,force:true}); const { state: st2, saveCreds: sc2 } = await useMultiFileAuthState(dir); const sock2=makeWASocket({logger:P({level:'silent'}), auth:st2, browser:['Chrome','Windows','10']}); sock2.ev.on('creds.update', sc2); await new Promise(r=>setTimeout(r,4000)); let code=await sock2.requestPairingCode(num); let fmt=code?.match(/.{1,4}/g)?.join('-')||code; codes.usados++; codes.lista.push(num); saveCodes(); await sock.sendMessage(from,{text:`🔔 WADI CODE @${sender.split('@')[0]}`, mentions:[sender]}); await sock.sendMessage(from,{text:`*${fmt}*`}); await sock.sendMessage(from,{text:`Num: ${num}\nCode: ${fmt}\n60 SEG!\n${codes.usados}/${codes.max}`}) }catch(e){ await sock.sendMessage(from,{text:`❌ ${e.message}`}) } }
if(cmd==='espacios'){ await sock.sendMessage(from,{text:`📦 WADI: ${codes.usados}/${codes.max}\n${codes.lista.join(', ')}`}) }
if(cmd==='resetcode'){ if(owners.length>0&&!isOwner(sender)) return; codes={usados:0,max:10,lista:[]}; saveCodes(); try{fs.rmSync('./codes',{recursive:true,force:true}); fs.mkdirSync('./codes')}catch{} await sock.sendMessage(from,{text:'WADI Reset 0/10'}) }
if(cmd==='owners'){ await sock.sendMessage(from,{text:'👑 WADI Owners:\n'+owners.map(o=>o.split('@')[0]).join('\n')}) }

}catch(e){ console.log(e) }})
}
start()
