let handler = async (m, { conn, usedPrefix, command }) => {
if (command == 'tes')
conn.reply(m.chat, `> 🤖 _Ademas te ofrecemos funciones necesarias para tus grupos, por ejemplo el antilink, antiarabe y bienvenida automática y muchos más, todo lo puedes encontrar en el .menu._`, m)

if (command == 'tes2')
let teks = `🗿 *Hola creador* ⭐El Numero Wa.me/${m.sender.split`@`[0]} Quiere de tus servicios`
conn.reply('50492280729@s.whatsapp.net', m.quoted ? teks + m.quoted : teks, null, { contextInfo: { mentionedJid: [m.sender] }})
conn.reply(m.chat, `⚖️ _Por favor espere, nuestro siguiente asesor disponible le atenderá en breve..._\n\nSerá Atendido por @50492280729 *🖐🏻Solo para asuntos importantes, no molestar.*`, m)

if (command == 'tes3')
conn.reply(m.chat, `https://chat.whatsapp.com/Cy42GegnKSmCVA6zxWlxKU?mode=ac_t`, m)
}
handler.command = ['tes', 'tes2', 'tes3']
export default handler
