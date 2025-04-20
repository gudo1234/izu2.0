import Starlights from "@StarlightsTeam/Scraper"

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(`${e} Ingresa el título de un video o canción de *YouTube*.\n\n*Ejemplo:* ${usedPrefix + command} Bad Bunny`)
    await m.react('🕓')
    try {
    let results = await Starlights.ytsearch(text)
    if (!results || !results.length) return conn.reply(m.chat, `No se encontraron resultados.`, m, rcanal)
    let img = await (await fetch(`${results[0].thumbnail}`)).buffer()
    let txt = '`乂  Y T  -  S E A R C H`'
    results.forEach((video, index) => {
        txt += `\n\n`
        txt += `	✩  *Nro* : ${index + 1}\n`
        txt += `	✩  *Titulo* : ${video.title}\n`
        txt += `	✩  *Duración* : ${video.duration}\n`
        txt += `	✩  *Publicado* : ${video.published}\n`
        txt += `	✩  *Autor* : ${video.author}\n`
        txt += `	✩  *Url* : ${video.url}`
    })
await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
await m.react('✅')
} catch {
await m.react('✖️')
}}

handler.command = ['ytsearch', 'yts']
handler.group = true;
export default handler
