let handler = async (m, { conn, usedPrefix, command }) => {

  if (command == 'tes') {
    conn.reply(m.chat, `> 🤖 _Además te ofrecemos funciones necesarias para tus grupos, por ejemplo el antilink, antiárabe y bienvenida automática y muchos más, todo lo puedes encontrar en el .menu._`, m)
  }

  if (command == 'tes2') {
    let teks = `🗿 *Hola creador* ⭐ El número Wa.me/${m.sender.split`@`[0]} quiere de tus servicios`
    conn.reply('50492280729@s.whatsapp.net', teks, m, { contextInfo: { mentionedJid: [m.sender] } }
    )
    conn.reply(m.chat, `⚖️ _Por favor espere, nuestro siguiente asesor disponible le atenderá en breve..._\n\nSerá atendido por @50492280729 *🖐🏻Solo para asuntos importantes, no molestar.*`, m, { contextInfo: { mentionedJid: ['50492280729@s.whatsapp.net'] } })
  }

  if (command == 'tes3') {
    conn.reply(m.chat, `🕒 *Horario de atención del bot*\n\nDe lunes a domingo de *8:00 AM* a *8:00 PM.*\n\n⚠️ *Recuerda:* Todo lo que no tenga que ver con el bot no será atendido.`, m)
  }

  if (command == 'tes4') {
    conn.reply(m.chat, `${e} *Grupo Oficial del Bot*\n\nhttps://chat.whatsapp.com/Cy42GegnKSmCVA6zxWlxKU?mode=ac_t`,m)
  }
}

handler.command = ['tes', 'tes2', 'tes3', 'tes4']
export default handler
