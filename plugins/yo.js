let handler = async (m, { conn, args, usedPrefix, command }) => {
m.react('🪐')
let txt = `ᴍᴇɴᴜ ᴘᴀʀᴀ ᴇʟ ᴏᴡɴᴇʀ\n\nClick aquí👇`
let txt2 = `> ⁉ ᴏᴘᴄɪᴏɴᴇs🔥
╔ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟┅ְֺ╗
${e}${s}update *‹›*
${e}${s}join *‹ł¡หк›*
${e}${s}=> *‹rєρℓy›*
${e}${s}> *‹rєρℓy›*
${e}${s}antiprivado *‹ᴏɴ/ᴏғғ›*
${e}${s}icon *‹rєρℓy›*
╚ְֺ─┅፝֟─ׅ━⃜─╲╳⵿╲⵿݊╱⵿╳╱─━ׅ⃜─፝֟`
  conn.sendEvent(m.chat, txt, txt2, "99999999999999999999999999999999999999999999", true)
}

handler.command = ['menuo', 'menuowner', 'menuyo']
handler.group = true
export default handler
