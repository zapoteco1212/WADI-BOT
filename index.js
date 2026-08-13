const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
if(!fs.existsSync('./economia.json')) fs.writeFileSync('./economia.json','{}')
if(!fs.existsSync('./owners.json')) fs.writeFileSync('./owners.json','[]')
if(!fs.existsSync('./codes.json')) fs.writeFileSync('./codes.json','{"usados":0,"max":10,"lista":[]}')
if(!fs.existsSync('./prefixes.json')) fs.writeFileSync('./prefixes.json','["×","."]')
let eco = JSON.parse(fs.readFileSync('./economia.json'))
let prefixes = JSON.parse(fs.readFileSync('./prefixes.json'))
let owners = JSON.parse(fs.readFileSync('./owners.json'))
let codes = JSON.parse(fs.readFileSync('./codes.json'))
const save = () => fs.writeFileSync('./economia.json', JSON.stringify(eco))
const saveOwners = () => fs.writeFileSync('./owners.json', JSON.stringify(owners))
const saveCodes = () => fs.writeFileSync('./codes.json', JSON.stringify(codes))
function get(id){
if(!eco[id]) eco[id]={coins:1000,xp:0,level:1,last:0}
if(eco[id].xp===undefined) eco[id].xp=0
if(eco[id].level===undefined) eco[id].level=1
if(eco[id].coins===undefined) eco[id].coins=1000
return eco[id]
}
function isOwner(id){ return owners.includes(id) }
async function start(){
const { state, saveCreds } = await useMultiFileAuthState('./session')
const sock = makeWASocket({ logger: P({level:'silent'}), auth: state })
sock.ev.on('creds.update', saveCreds)
sock.ev.on('connection.update', u=>{
if(u.qr) qrcode.generate(u.qr,{small:true})
if(u.connection==='open') console.log('LOLIBOT FULL RPG OK')
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
if(cmd==='menu' || cmd==='help' || cmd==='allmenu'){
let menu=`
╭━━━━━━━━━━━━━━━━━━╮
┃ 〔 *LoliBot RPG* 〕 💮
┃ Hola @${sender.split('@')[0]}
┃ Coins: ${user.coins} | XP: ${user.xp} | Lv: ${user.level}
┃ Owner: ${isOwner(sender)?'✅ SI':'❌ NO'}
╰━━━━━━━━━━━━━━━━━━╯

┏━━━〔 *💰 ECONOMIA* 〕━━━
┃ ×bal [@user] - balance
┃ ×daily - 500 cada 24h
┃ ×work - trabajar
┃ ×rob @user - robar
┃ ×pay @user 100 - pagar
┃ ×top - ranking
┃ ×tienda - tienda
┗━━━━━━━━━━━━━━━━━━

┏━━━〔 *⚔️ RPG* 〕━━━
┃ ×level - tu nivel
┃ ×aventura - aventura
┃ ×cazar - cazar
┃ ×minar - minar
┃ ×pescar - pescar
┃ ×heal - curar
┃ ×inventario - tu inv
┗━━━━━━━━━━━━━━━━━━

┏━━━〔 *🎰 JUEGOS* 〕━━━
┃ ×slot 100 - tragamonedas
┃ ×dado - dado
┃ ×ppt piedra/papel/tijera
┃ ×cara - cara o cruz
┃ ×ruleta 100
┃ ×blackjack 100
┗━━━━━━━━━━━━━━━━━━

┏━━━〔 *👑 GRUPO* 〕━━━
┃ ×ban @user - banear
┃ ×kick @user
┃ ×promote @user - admin
┃ ×demote @user
┃ ×link - link grupo
┃ ×hidetag texto - todos
┃ ×tagall - todos
┗━━━━━━━━━━━━━━━━━━

┏━━━〔 *🔗 CODE - 10 SLOTS* 〕━━━
┃ ×code 52xxx - generar code
┃ - El code dura 60 seg!
┃ - Usa OTRO numero, no el del bot
┃ ×espacios - ver 0/10
┃ ×resetcode - reset (owner)
┗━━━━━━━━━━━━━━━━━━

┏━━━〔 *👑 OWNER ONLY* 〕━━━
┃ ×addcoins @user 1000
┃ ×givecoins @user 1000
┃ ×givexp @user 100
┃ ×dar owner 52xxx
┃ ×owners
┗━━━━━━━━━━━━━━━━━━
`.trim()
await sock.sendMessage(from,{text:menu, mentions:[sender]})
}
if(cmd==='bal'){
let id=target||sender
let u=get(id)
await sock.sendMessage(from,{text:`💰 BALANCE\n@${id.split('@')[0]}\nCoins: ${u.coins}\nXP: ${u.xp}\nLevel: ${u.level}`, mentions:[id]})
}
if(cmd==='level' || cmd==='lvl'){
await sock.sendMessage(from,{text:`⚔️ NIVEL\n@${sender.split('@')[0]}\nLevel: ${user.level}\nXP: ${user.xp}\nCoins: ${user.coins}\nFalta para subir: ${user.level*100 - user.xp} XP`, mentions:[sender]})
}
if(cmd==='daily'){ const now=Date.now(); if(now-user.last<86400000) return sock.sendMessage(from,{text:`Ya reclamaste, vuelve en ${Math.floor((86400000-(now-user.last))/3600000)}h`}); user.coins+=500; user.xp+=20; if(user.xp>=user.level*100){ user.level++; user.xp=0 } user.last=now; save(); await sock.sendMessage(from,{text:`+500 coins +20 xp\nLevel: ${user.level}`}) }
if(cmd==='work'){ user.coins+=100; user.xp+=10; if(user.xp>=user.level*100){ user.level++; user.xp=0; await sock.sendMessage(from,{text:`🎉 SUBISTE A NIVEL ${user.level}!`}) } save(); await sock.sendMessage(from,{text:`Trabajaste +100 coins +10 xp`}) }
if(cmd==='aventura' || cmd==='adventure'){ user.xp+=15; user.coins+=50; save(); await sock.sendMessage(from,{text:`⚔️ Fuiste a aventura\n+50 coins +15 xp`}) }
if(cmd==='cazar' || cmd==='hunt'){ let g=Math.floor(Math.random()*100)+20; user.coins+=g; user.xp+=10; save(); await sock.sendMessage(from,{text:`🏹 Cazaste y ganaste ${g} coins +10 xp`}) }
if(cmd==='slot'){ let ap=parseInt(args[1])||100; if(user.coins<ap) return sock.sendMessage(from,{text:'No tienes coins'}); let e=['🍒','🍋','💮','7️⃣']; let a=e[0|Math.random()*4],b=e[0|Math.random()*4],c=e[0|Math.random()*4]; if(a===b&&b===c){ user.coins+=ap*3; await sock.sendMessage(from,{text:`${a}|${b}|${c} JACKPOT +${ap*3}`}) }else{ user.coins-=ap; await sock.sendMessage(from,{text:`${a}|${b}|${c} Perdiste ${ap}`}) } save() }
if(cmd==='dar' && args[1]==='owner'){
let num=args[2]?.replace(/[^0-9]/g,''); if(!num) return sock.sendMessage(from,{text:'Usa: ×dar owner 52xxxxx'})
let newOwner=num+'@s.whatsapp.net'
if(owners.length===0){ owners.push(sender); if(!owners.includes(newOwner)) owners.push(newOwner); saveOwners(); await sock.sendMessage(from,{text:`✅ OWNER ${num}`}) }
else{ if(!isOwner(sender)) return sock.sendMessage(from,{text:'❌ Solo owners'}); if(owners.includes(newOwner)) return sock.sendMessage(from,{text:'Ya es owner'}); owners.push(newOwner); saveOwners(); await sock.sendMessage(from,{text:`✅ ${num} OWNER`}) }
}
if(cmd==='addcoins' || cmd==='givecoins'){
if(!isOwner(sender)) return sock.sendMessage(from,{text:'❌ Solo OWNER'})
let amount=parseInt(args[args.length-1]); if(!target) return sock.sendMessage(from,{text:'Menciona'})
let u=get(target); u.coins+=amount; save()
await sock.sendMessage(from,{text:`✅ ${amount} coins a @${target.split('@')[0]}`, mentions:[target]})
}
if(cmd==='givexp'){
if(!isOwner(sender)) return sock.sendMessage(from,{text:'❌ Solo OWNER'})
let amount=parseInt(args[args.length-1]); if(!target) return sock.sendMessage(from,{text:'Menciona'})
let u=get(target); u.xp+=amount; if(u.xp>=u.level*100){ u.level++; u.xp=0 } save()
await sock.sendMessage(from,{text:`✅ ${amount} XP a @${target.split('@')[0]}`, mentions:[target]})
}
if(cmd==='code'){
let num=args[1]?.replace(/[^0-9]/g,'')
if(!num) return sock.sendMessage(from,{text:'Usa: ×code 593989068253\nSin + y sin espacios\n⚠️ NO uses el numero del bot, usa otro'})
if(codes.usados>=codes.max) return sock.sendMessage(from,{text:`❌ Sin espacios ${codes.usados}/${codes.max}`})
await sock.sendMessage(from,{text:`⏳ Generando code para ${num}...`})
try{
let dir='./codes/'+num
if(fs.existsSync(dir)) fs.rmSync(dir,{recursive:true,force:true})
const { state: st2, saveCreds: sc2 } = await useMultiFileAuthState(dir)
const sock2 = makeWASocket({ logger: P({level:'silent'}), auth: st2, browser:['Chrome','Windows','10'] })
sock2.ev.on('creds.update', sc2)
await new Promise(r=>setTimeout(r,4000))
let code = await sock2.requestPairingCode(num)
let formatted = code?.match(/.{1,4}/g)?.join('-') || code
codes.usados++; codes.lista.push(num); saveCodes()
// NOTIFICACION SEPARADA
await sock.sendMessage(from,{text:`🔔 CODE GENERADO @${sender.split('@')[0]}`, mentions:[sender]})
await new Promise(r=>setTimeout(r,500))
await sock.sendMessage(from,{text:`*${formatted}*`})
await new Promise(r=>setTimeout(r,500))
await sock.sendMessage(from,{text:`Numero: ${num}\nCode: ${formatted}\n\n⚠️ VALIDO 60 SEGUNDOS!\nVe rapido a:\nWhatsApp > Dispositivos vinculados > Vincular con numero de telefono > Pega el code\n\nEspacios: ${codes.usados}/${codes.max}`})
}catch(e){
console.log(e)
await sock.sendMessage(from,{text:`❌ Error: ${e.message}\nSi dice rate-limit espera 15 min`})
}
}

if(cmd==='lb' || cmd==='leaderboard' || cmd==='xptop'){
let top = Object.entries(eco).sort((a,b)=> (b[1].xp||0)-(a[1].xp||0)).slice(0,10)
let t='🏆 *TOP XP - LB* ✨\n\n'
top.forEach(([id,d],i)=>{
let med=i==0?'🥇':i==1?'🥈':i==2?'🥉':` ${i+1}.`
t+=`${med} @${id.split('@')[0]} - Lv ${d.level||1} - ${d.xp||0} XP\n`
})
await sock.sendMessage(from,{text:t, mentions:top.map(x=>x[0])})
}
if(cmd==='baltop' || cmd==='topmoney' || cmd==='top'){
let top = Object.entries(eco).sort((a,b)=> (b[1].coins||0)-(a[1].coins||0)).slice(0,10)
let t='💰 *BALT0P - TOP DINERO* 💵\n\n'
top.forEach(([id,d],i)=>{
let med=i==0?'🥇':i==1?'🥈':i==2?'🥉':` ${i+1}.`
t+=`${med} @${id.split('@')[0]} - ${d.coins||0} coins\n`
})
await sock.sendMessage(from,{text:t, mentions:top.map(x=>x[0])})
}
if(cmd==='p' || cmd==='ping'){
let up = process.uptime()
let h=Math.floor(up/3600), m=Math.floor((up%3600)/60), s=Math.floor(up%60)
await sock.sendMessage(from,{text:`✅ *LoliBot ACTIVA* 💮\n⏱️ Activa: ${h}h ${m}m ${s}s\n👤 Tu: @${sender.split('@')[0]}\n💰 Coins: ${user.coins} | XP: ${user.xp} | Lv: ${user.level}`, mentions:[sender]})
}

if(cmd==='espacios'){ await sock.sendMessage(from,{text:`Espacios: ${codes.usados}/${codes.max}\n${codes.lista.join(', ')}`}) }
if(cmd==='resetcode'){ if(!isOwner(sender)) return sock.sendMessage(from,{text:'Solo owner'}); codes={usados:0,max:10,lista:[]}; saveCodes(); try{ fs.rmSync('./codes',{recursive:true,force:true}); fs.mkdirSync('./codes',{recursive:true}) }catch{} await sock.sendMessage(from,{text:'Reset 0/10'}) }

if(cmd==='reseteco' || cmd==='resetmoney' || cmd==='reseteconomia'){
if(!isOwner(sender)) return sock.sendMessage(from,{text:'❌ Solo OWNER 👑'})
for(let id in eco){ eco[id].coins=0 }
save()
await sock.sendMessage(from,{text:'✅ Economia reseteada\nTodos ahora tienen 0 coins'})
}
if(cmd==='resetxp' || cmd==='resetlevel'){
if(!isOwner(sender)) return sock.sendMessage(from,{text:'❌ Solo OWNER 👑'})
for(let id in eco){ eco[id].xp=0; eco[id].level=1 }
save()
await sock.sendMessage(from,{text:'✅ XP reseteado\nTodos ahora Lv 1 con 0 XP'})
}

if(cmd==='setprefix' || cmd==='prefix'){
if(!isOwner(sender)) return sock.sendMessage(from,{text:'❌ Solo OWNER 👑'})
let newPrefRaw = args.slice(1).join(' ') || args[1]
if(!newPrefRaw) return sock.sendMessage(from,{text:'Usa: ×setprefix #/.,+†\nEjemplo: ×setprefix #/.,+†\nActual: '+prefixes.join(' ')})
// Separar cada caracter como prefijo individual, sin espacios
let list = newPrefRaw.split('').filter(c=>c.trim()!=='')
list = [...new Set(list)] // quitar repetidos
// Siempre dejar × como base para no quedarte sin prefijo
if(!list.includes('×')) list.unshift('×')
prefixes = list
fs.writeFileSync('./prefixes.json', JSON.stringify(prefixes))
await sock.sendMessage(from,{text:'✅ Prefijos cambiados\nAhora: '+prefixes.map(p=>"'"+p+"'").join(' ')+'\nPrueba: '+prefixes[0]+'menu'})
}
if(cmd==='getprefix' || cmd==='prefixlist'){
await sock.sendMessage(from,{text:'Prefijos actuales: '+prefixes.join(' ')})
}

if(cmd==='resetall' || cmd==='reset'){
if(!isOwner(sender)) return sock.sendMessage(from,{text:'❌ Solo OWNER 👑'})
for(let id in eco){ eco[id].coins=0; eco[id].xp=0; eco[id].level=1; eco[id].last=0 }
save()
await sock.sendMessage(from,{text:'💥 RESET TOTAL\nTodos: 0 coins, 0 XP, Lv 1'})
}


if(cmd==='dado' || cmd==='dice'){
let n=Math.floor(Math.random()*6)+1
await sock.sendMessage(from,{text:`🎲 Dado: ${n}`})
}
if(cmd==='cara' || cmd==='coin'){
let r=Math.random()<0.5?'CARA':'CRUZ'
await sock.sendMessage(from,{text:`🪙 ${r}`})
}
if(cmd==='ppt'){
let op=(args[1]||'').toLowerCase()
let ops=['piedra','papel','tijera']
if(!ops.includes(op)) return sock.sendMessage(from,{text:'Usa: ×ppt piedra/papel/tijera'})
let bot=ops[Math.floor(Math.random()*3)]
let win=''
if(op===bot) win='Empate'
else if((op==='piedra'&&bot==='tijera')||(op==='papel'&&bot==='piedra')||(op==='tijera'&&bot==='papel')){ win='Ganaste'; user.coins+=50; user.xp+=5 }
else{ win='Perdiste'; user.coins=Math.max(0,user.coins-20) }
save()
await sock.sendMessage(from,{text:`Tu: ${op}\nBot: ${bot}\n${win}`})
}
if(cmd==='ruleta'){
let ap=parseInt(args[1])||100
if(user.coins<ap) return sock.sendMessage(from,{text:'No tienes coins'})
let win=Math.random()<0.5
if(win){ user.coins+=ap; await sock.sendMessage(from,{text:`🎰 Ruleta VERDE GANASTE + ${ap}`}) }else{ user.coins-=ap; await sock.sendMessage(from,{text:`🎰 Ruleta ROJO PERDISTE - ${ap}`}) }
save()
}
if(cmd==='blackjack' || cmd==='bj'){
let ap=parseInt(args[1])||100
if(user.coins<ap) return sock.sendMessage(from,{text:'No tienes coins'})
let u=Math.floor(Math.random()*11)+11
let b=Math.floor(Math.random()*11)+11
let res=''
if(u>b && u<=21){ user.coins+=ap; res=`Tu ${u} vs Bot ${b} GANASTE + ${ap}` }
else if(u===b){ res=`Tu ${u} vs Bot ${b} EMPATE` }
else{ user.coins-=ap; res=`Tu ${u} vs Bot ${b} PERDISTE - ${ap}` }
save()
await sock.sendMessage(from,{text:'🃏 '+res})
}
// GRUPO
if(cmd==='link' || cmd==='linkgroup'){
if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'Solo en grupos'})
try{ let code=await sock.groupInviteCode(from); await sock.sendMessage(from,{text:'Link: https://chat.whatsapp.com/'+code}) }catch{ await sock.sendMessage(from,{text:'No soy admin'}) }
}
if(cmd==='kick' || cmd==='ban'){
if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'Solo grupos'})
if(!target) return sock.sendMessage(from,{text:'Menciona: ×kick @user'})
try{ await sock.groupParticipantsUpdate(from,[target],'remove'); await sock.sendMessage(from,{text:`✅ Baneado @${target.split('@')[0]}`, mentions:[target]}) }catch{ await sock.sendMessage(from,{text:'No puedo banear, no soy admin'}) }
}
if(cmd==='promote'){
if(!from.endsWith('@g.us')) return
if(!target) return sock.sendMessage(from,{text:'Menciona: ×promote @user'})
try{ await sock.groupParticipantsUpdate(from,[target],'promote'); await sock.sendMessage(from,{text:`✅ Admin @${target.split('@')[0]}`, mentions:[target]}) }catch{ await sock.sendMessage(from,{text:'No soy admin'}) }
}
if(cmd==='demote'){
if(!from.endsWith('@g.us')) return
if(!target) return sock.sendMessage(from,{text:'Menciona: ×demote @user'})
try{ await sock.groupParticipantsUpdate(from,[target],'demote'); await sock.sendMessage(from,{text:`✅ Ya no es admin @${target.split('@')[0]}`, mentions:[target]}) }catch{ await sock.sendMessage(from,{text:'No soy admin'}) }
}
if(cmd==='tagall' || cmd==='hidetag'){
if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'Solo grupos'})
try{
let group=await sock.groupMetadata(from)
let mems=group.participants.map(p=>p.id)
let txt=args.slice(1).join(' ')||'Todos 📢'
await sock.sendMessage(from,{text:txt, mentions:mems})
}catch(e){ await sock.sendMessage(from,{text:'Error tagall'}) }
}

}catch(e){ console.log(e) }})
}
start()
