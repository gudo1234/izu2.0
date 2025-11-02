Pone este import fs from 'fs'

let handler = async (m, { conn }) => {
  try {
    /*const fake = {
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

    const rcanal = {
      key: {
        remoteJid: 'status@broadcast',
        participant: '0@s.whatsapp.net'
      },
      message: {
        conversation: '🛍 Promocionado por Realice'
      }
    }*/

    if (!global.db?.data?.chats) global.db = { data: { chats: {} } }

    if (!(m.chat in global.db.data.chats)) 
      return conn.reply(m.chat, '〽️🔥 *¡Este chat no está registrado!*', m)
    
    let chat = global.db.data.chats[m.chat]

    if (!chat.isBanned) 
      return conn.reply(m.chat, '👑 *¡ᴇʟ ʙᴏᴛ ɴᴏ ᴇsᴛᴀ ʙᴀɴᴇᴀᴅᴏ ᴇɴ ᴇsᴛᴇ ᴄʜᴀᴛ!*', m)

    chat.isBanned = false

    await conn.reply(m.chat, '⚡ *¡ᴇʟ ʙᴏᴛ ʏᴀ ғᴜᴇ ᴅᴇsʙᴀɴᴇᴀᴅᴏ ᴇɴ ᴇsᴛᴇ ᴄʜᴀᴛ!*', m)

  } catch (e) {
    console.error('Error en unbanchat:', e)
    conn.reply(m.chat, '❌ *Error al intentar desbanear el chat.*\n' + e.message, m)
  }
}

handler.help = ['unbanchat']
handler.tags = ['grupo']
handler.command = ['unbanchat', 'desbanearchat', 'desbanchat']
handler.admin = true
handler.botadmin = true
handler.group = true

export default handler
