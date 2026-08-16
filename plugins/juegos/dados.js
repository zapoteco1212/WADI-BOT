export const command = ['dados','dado']

export default async (sock, msg, { jid }) => {
  const d1 = Math.floor(Math.random()*6)+1
  const d2 = Math.floor(Math.random()*6)+1
  const total = d1 + d2
  
  let msgTxt = `🎲 *JUEGO DE DADOS* 🎲\n\n`
  msgTxt += `🎲 Dado 1: ${d1}\n`
  msgTxt += `🎲 Dado 2: ${d2}\n`
  msgTxt += `━━━━━━━━━━━━━━\n`
  msgTxt += `Total: *${total}*\n\n`
  
  if(total === 12) msgTxt += `🔥 ¡DOBLE 6! ¡JACKPOT!`
  else if(total >= 10) msgTxt += `🎉 ¡Buenísima tirada!`
  else if(total === 2) msgTxt += `💀 ¡Snake Eyes!`
  else msgTxt += `👍 Bien`

  await sock.sendMessage(jid, { text: msgTxt }, { quoted: msg })
}
