import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {

if (!text) throw m.reply(`${emoji} Por favor, ingresa un link de mediafire.`);
conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        let ouh = await fetch(`https://api.agatz.xyz/api/mediafire?url=${text}`)
  let gyh = await ouh.json() 
        await conn.sendFile(m.chat, gyh.data[0].link, `${gyh.data[0].nama}`, `*Nombre:*  ${gyh.data[0].nama}\n*Peso:* ${gyh.data[0].size}*\n*Type:* ${gyh.data[0].mime}`, m, null, rcanal)       
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
}

handler.command = ['mf', 'mediafire']
handler.group = true

export default handler
