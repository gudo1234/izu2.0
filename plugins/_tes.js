let handler = async (m, { conn, usedPrefix, command }) => {

  if (command == 'tes') {
    conn.reply(
      m.chat, 
      `> 🤖 _Además te ofrecemos funciones necesarias para tus grupos, por ejemplo el antilink, antiárabe y bienvenida automática y muchos más, todo lo puedes encontrar en el .menu._`, 
      m
    )
  }

  if (command == 'tes2') {
    let teks = `🗿 *Hola creador* ⭐ El número Wa.me/${m.sender.split`@`[0]} quiere de tus servicios`
    
    // Enviar mensaje al creador
    conn.reply(
      '50492280729@s.whatsapp.net', 
      teks,
      m,
      { contextInfo: { mentionedJid: [m.sender] } }
    )
    
    // Mensaje de confirmación al usuario con mención
    conn.reply(
      m.chat, 
      `⚖️ _Por favor espere, nuestro siguiente asesor disponible le atenderá en breve..._\n\nSerá atendido por @50492280729 *🖐🏻Solo para asuntos importantes, no molestar.*`, 
      m,
      { contextInfo: { mentionedJid: ['50492280729@s.whatsapp.net'] } }
    )
  }

  if (command == 'tes3') {
    conn.reply(
      m.chat, 
      `https://chat.whatsapp.com/Cy42GegnKSmCVA6zxWlxKU?mode=ac_t`, 
      m
    )
  }

}

handler.command = ['tes', 'tes2', 'tes3']
export default handler
