import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw m.reply(`${e} Por favor, ingresa el link de un video/imagen de Pinterest.`);
conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
	let ouh = await fetch(`https://api.agatz.xyz/api/pinterest?url=${text}`)
  let gyh = await ouh.json()
	await conn.sendFile(m.chat, gyh.data.result, `pinvideobykeni.mp4`, `*${emoji} Url:* ${gyh.data.url}`, m, null, rcanal)
	await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
}

handler.command = ['pinvideo', 'pinvid']
handler.group = true;

export default handler
