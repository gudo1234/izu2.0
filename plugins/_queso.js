let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { text: '🧀zo' }, { quoted: m})
}

handler.customPrefix = /^(Que|que|qe|ke|Qe|k|Ke|Kee|Quee)$/i
handler.command = new RegExp
export default handler
