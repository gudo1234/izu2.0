import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn: star, command, args, text, usedPrefix }) => {
  if (!text) return m.reply(
`${e} Ingresa el título de un video o canción de *YouTube*.

🔎 *Ejemplo:*
> *${usedPrefix + command}* Poker Face`
  )
  
  await m.react('🕓')
  try {
    let res = await search(args.join(" "))
    let img = await (await fetch(res[0].image)).buffer()
    
    let txt = `╭───── • ─────╮
  𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ 📼 *Título:* ${res[0].title}
✦ ⏱ *Duración:* ${secondString(res[0].duration.seconds)}
✦ 📅 *Publicado:* ${eYear(res[0].ago)}
✦ 👤 *Canal:* ${res[0].author.name || 'Desconocido'}
✦ 🆔 *ID:* ${res[0].videoId}
✦ 🔗 *URL:* https://youtu.be/${res[0].videoId}

> *Responde a este mensaje con:* 
\`Video\`ó \`Audio\` para descargar...`
    
    await star.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
    await m.react('✅')
  } catch {
    await m.react('✖️')
  }
}

handler.command = ['music', 'musica', 'música']
handler.group = true
export default handler

async function search(query, options = {}) {
  let search = await yts.search({ query, hl: "es", gl: "ES", ...options })
  return search.videos
}

function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? ' Día, ' : ' Días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' Hora, ' : ' Horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' Minuto, ' : ' Minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' Segundo' : ' Segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function eYear(txt) {
  if (!txt) return '×'
  return txt
    .replace(/(\d+)\smonth[s]?\sago/, 'hace $1 mes$1')
    .replace(/(\d+)\syear[s]?\sago/, 'hace $1 año$1')
    .replace(/(\d+)\shour[s]?\sago/, 'hace $1 hora$1')
    .replace(/(\d+)\sminute[s]?\sago/, 'hace $1 minuto$1')
    .replace(/(\d+)\sday[s]?\sago/, 'hace $1 día$1')
    .replace('s año1', 's años')
    .replace('s mes1', 's meses')
    .replace('s hora1', 's horas')
    .replace('s minuto1', 's minutos')
    .replace('s día1', 's días')
}
