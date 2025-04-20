import Starlights from '@StarlightsTeam/Scraper'

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `${e} Ingresa el título de un artista o música de Spotify`, m)
  await m.react('🕓')
  try {
    let res = await Starlights.spotifySearch(text)
    let img = await (await fetch(`${res[0].thumbnail}`)).buffer()
    let txt = '`乂  S P O T I F Y  -  S E A R C H`'
    for (let i = 0; i < res.length; i++) {
      txt += `\n\n`
      txt += `  *» Nro* : ${i + 1}\n`
      txt += `  *» Titulo* : ${res[i].title}\n`
      txt += `  *» Artista* : ${res[i].artist}\n`
      txt += `  *» Url* : ${res[i].url}`
    }
    
await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
await m.react('✅')
} catch {
await m.react('✖️')
}}

handler.command = ['spotifysearch']
handler.group = true;

export default handler
