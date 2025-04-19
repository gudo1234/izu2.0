import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    if (!text) {
        if (m.quoted && m.quoted.text) {
            text = m.quoted.text
        } else {
            return m.reply(`${e} Por Favor, Ingresa Un Texto Para Realizar Tu Sticker.`)
        }
    }

    let teks = encodeURI(text)
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}
    let texto1 = packstickers.text1 || global.packsticker
    let texto2 = packstickers.text2 || global.packsticker2

    if (command == 'attp') {
        let stiker = await sticker(null, `https://api.fgmods.xyz/api/maker/attp?text=${teks}&apikey=elrebelde21`, `${m.pushName}`)
        conn.sendFile(m.chat, stiker, 'sticker.webp', '',m, true, { contextInfo: { 'forwardingScore': 200, 'isForwarded': false, externalAdReply:{ showAdAttribution: false, title: `${m.pushName}`, body: textbot, mediaType: 2, sourceUrl: redes, thumbnail: icons}}}, { quoted: m })
    }

    if (command == 'ttp') {
        let stiker = await sticker(null, `https://api.fgmods.xyz/api/maker/ttp?text=${teks}&apikey=elrebelde21`, `${m.pushName}`)
        conn.sendFile(m.chat, stiker, 'sticker.webp', '',m, true, { contextInfo: { 'forwardingScore': 200, 'isForwarded': false, externalAdReply:{ showAdAttribution: false, title: `${m.pushName}`, body: textbot, mediaType: 2, sourceUrl: redes, thumbnail: icons}}}, { quoted: m })
    }
}

handler.tags = ['sticker']
handler.help = ['ttp', 'attp']
handler.command = ['ttp', 'attp']

export default handler
