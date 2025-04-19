import { sticker } from '../lib/sticker.js'
import fg from 'api-dylux'
let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) throw `Agregue un texto junto a al comando, ejemplo: ${usedPrefix + command} edar` 
    let color = '2FFF2E' //color
    let res = await fg.ttp(text, color) 
    let stiker = await sticker(null, res.result, global.packname, global.author)
m.react('🕒')
    if (stiker) return await conn.sendFile(m.chat, stiker, '', '', m, null)
    throw stiker.toString()
}

handler.command = ['ttp']
handler.group = true;

export default handler
