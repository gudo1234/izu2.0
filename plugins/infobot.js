import os from 'os'
import { getDevice } from "@whiskeysockets/baileys"
import moment from 'moment-timezone'
import util from 'util'
import ws from 'ws';
import sizeFormatter from 'human-readable'
let MessageType =  (await import(global.baileys)).default

import fs from 'fs'
import { performance } from 'perf_hooks'
let handler = async (m, { conn, usedPrefix }) => {
let _uptime = process.uptime() * 1000
let uptime = clockString(_uptime) 
let totalreg = Object.keys(global.db.data.users).length
const thumbnail = await (await fetch(icono)).buffer()
const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))
const groups = chats.filter(([id]) => id.endsWith('@g.us'))
const used = process.memoryUsage()
const cpus = os.cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
    return cpu
  })
const cpu = cpus.reduce((last, cpu, _, { length }) => {
    last.total += cpu.total
    last.speed += cpu.speed / length
    last.times.user += cpu.times.user
    last.times.nice += cpu.times.nice
    last.times.sys += cpu.times.sys
    last.times.idle += cpu.times.idle
    last.times.irq += cpu.times.irq
    return last
  }, {
    speed: 0,
    total: 0,
    times: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    }
  })
const { restrict } = global.db.data.settings[conn.user.jid] || {}
const { autoread } = global.opts
//let img = await (await fetch(`https://i.ibb.co/mGm8Vbz/file.png`)).buffer()
let img = await (await fetch(`https://i.ibb.co/W3hmLwX/file.jpg`)).buffer()
//let img = imagen1
//let grupos = [nna, nn, nnn, nnntt]
//let gata = [img5, img6, img7, img8, img9]
//let enlace = { contextInfo: { externalAdReply: {title: wm + ' ', body: 'support group' , sourceUrl: accountsgb, thumbnail: await(await fetch(gataMenu)).buffer() }}}
//let enlace2 = { contextInfo: { externalAdReply: { showAdAttribution: true, mediaUrl: yt, mediaType: 'VIDEO', description: '', title: wm, body: md, thumbnailUrl: await(await fetch(gataMenu)).buffer(), sourceUrl: accountsgb }}}
//let dos = [enlace, enlace2]
let taguser = '@' + m.sender.split("@s.whatsapp.net")[0]
let old = performance.now()
  
  let neww = performance.now()
  //let totaljadibot = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
  let speed = neww - old
const fechahon = moment().tz('America/Tegucigalpa').format('DD/MM HH:mm')
//const nb = await fetch(`https://deliriusapi-official.vercel.app/tools/country?text=${m.sender}`);
//const res = await nb.json();
//let timestamp = speed();
        // let latensi = speed() - timestamp;
        // exec(`neofetch --stdout`, (error, stdout, stderr) => {
let txt = `> ⁉ ɪɴғᴏ - ʙᴏᴛ
╔ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╗
${e}${e} *ᴍᴏᴅᴏ*‹público›
${e}${e} *ᴘʀᴇғɪᴊᴏ* (#./!)*
${e}${e} *ᴄʜᴀᴛs ᴘʀɪᴠᴀᴅᴏs:* ${chats.length - groups.length}
${e}${e} *ɢʀᴜᴘᴏs:* ${groups.length}
${e}${e} *ᴀᴄᴛɪᴠᴏ ʜᴀᴄᴇ:* ${uptime}
${e}${e} *ғᴇᴄʜᴀ/ʜᴏʀᴀ:* ${fechahon}
${e}${e} *ᴜʙɪᴄᴀᴄɪᴏɴ:* Honduras (🇭🇳)
╚ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟╝╯`
wait m.react('📡')
await conn.sendMessage(m.chat, {
      text: txt,
      footer: textbot,
      contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
              newsletterJid: channelRD.id,
              newsletterName: channelRD.name,
              serverMessageId: -1,
          },
          forwardingScore: false,
          externalAdReply: {
              title: wm,
              body: textbot,
              thumbnailUrl: redes,
              thumbnail,
              sourceUrl: redes,
              mediaType: 1,
              showAdAttribution: true,
              renderLargerThumbnail: true,
          },
      },
  }, { quoted: m });
}

handler.command = ['info', 'infobot']
export default handler

function clockString(ms) {
let h = Math.floor(ms / 3600000)
let m = Math.floor(ms / 60000) % 60
let s = Math.floor(ms / 1000) % 60
console.log({ms,h,m,s})
return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')}
