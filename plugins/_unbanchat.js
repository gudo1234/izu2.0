import fs from 'fs'

let handler = async (m, { conn }) => {
  // Mensajes falsos o de contexto visual
  const fake = {
    key: {
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'BAE5',
      participant: '0@s.whatsapp.net'
    },
    message: {
      orderMessage: {
        itemCount: 1,
        status: 1,
        surface: 1,
        message: '🌐 Desbaneo de Chat',
        orderTitle: 'menu',
        thumbnail: fs.readFileSync('./media/menus/Menu1.jpg'),
        sellerJid: '0@s.whatsapp.net'
      }
    }
  }

  // Mensaje estilo canal
  const rcanal = {
    key: {
      remoteJid: 'status@broadcast',
      participant: '0@s.whatsapp.net'
    },
    message: {
      conversation: '🛍 Promocionado por Realice'
    }
  }

  // Verifica si el chat está en la base de datos
  if (!(m.chat in global.db.data.chats)) 
    return conn.reply(m.chat, '〽️🔥 *¡Este chat no está registrado!*', m, rcanal)
  
  // Obtiene los datos del chat
  let chat = global.db.data.chats[m.chat]

  // Si el bot no está baneado
  if (!chat.isBanned) 
    return conn.reply(m.chat, '👑 *¡ᴇʟ ʙᴏᴛ ɴᴏ ᴇsᴛᴀ ʙᴀɴᴇᴀᴅᴏ ᴇɴ ᴇsᴛᴇ ᴄʜᴀᴛ!*', m, fake)

  // Desbanea el bot en el grupo
  chat.isBanned = false

  // Envía confirmación de éxito
  await conn.reply(m.chat, '⚡ *¡ᴇʟ ʙᴏᴛ ʏᴀ ғᴜᴇ ᴅᴇsʙᴀɴᴇᴀᴅᴏ ᴇɴ ᴇsᴛᴇ ᴄʜᴀᴛ!*', m, rcanal)
}

handler.command = ['unbanchat', 'desbanearchat', 'desbanchat']
handler.admin = true
handler.botadmin = true
handler.group = true

export default handler
