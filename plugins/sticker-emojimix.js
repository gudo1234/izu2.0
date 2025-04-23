import MessageType from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'
import fs from "fs"
const fetchJson = (url, options) => new Promise(async (resolve, reject) => {
fetch(url, options)
.then(response => response.json())
.then(json => {
resolve(json)
})
.catch((err) => {
reject(err)
})})
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
if (!args[0]) return m.reply(`${e} Ejemplo: *${usedPrefix + command}* 😎+🤑`)
const thumbnail = await (await fetch(icono)).buffer()
let [emoji, emoji2] = text.split`+`
let anu = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji)}_${encodeURIComponent(emoji2)}`)
for (let res of anu.results) {
let stiker = await sticker(false, res.url, `${m.pushName}`)
conn.sendFile(m.chat, stiker, 'sticker.webp', '',m, true, { contextInfo: { 'forwardingScore': 200, 'isForwarded': false, externalAdReply:{ showAdAttribution: false, title: `${m.pushName}`, body: textbot, mediaType: 1, sourceUrl: redes, thumbnailUrl: redes, thumbnail}}}, { quoted: m })
}}
handler.help = ['emojimix *<emoji+emoji>*']
handler.tags = ['sticker']
handler.command = ['emojimix'] 
handler.group = true;

export default handler
