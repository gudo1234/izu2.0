let handler = async (m, { conn, args, usedPrefix, command }) => {
let txt = `zoo🧀`
  await conn.sendMessage(m.chat, { text: txt }, { quoted: m})
}

handler.customPrefix = /^(Que|que|qe|ke|Qe|k|Ke|Kee|Quee)$/i
handler.command = new RegExp
export default handler
