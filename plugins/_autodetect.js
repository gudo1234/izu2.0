
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default

let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
  try {
    
    if (!m?.messageStubType || !m?.isGroup) return

    const chat = global?.db?.data?.chats?.[m.chat] || {}
    if (!chat.detect) return

    
    const safeStr = v => (typeof v === 'string' ? v : '')
    const first = (s, sep='@') => safeStr(s).split(sep)[0]

    
    const senderJid =
      m?.sender ||
      m?.key?.participant ||
      m?.participant ||
      m?.key?.remoteJid ||
      ''

    const usuario = senderJid ? `@${first(senderJid)}` : '@usuario'

    
    const p0 = safeStr(m?.messageStubParameters?.[0])

    
    const mentions = []
    if (senderJid) mentions.push(senderJid)
    if (p0) mentions.push(p0)

    
    let pp =
      (await conn.profilePictureUrl(m.chat, 'image').catch(_ => null)) ||
      'https://files.catbox.moe/xr2m6u.jpg'

    
    const nombre  = `🚦 ${usuario} ha cambiado el nombre del grupo.\n\n> ✧ Ahora el grupo se llama:\n> *${p0 || '(sin dato)'}*.`
    const foto    = `🚀 Se ha cambiado la imagen del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`
    const edit    = `🎈 ${usuario} ha permitido que ${p0 === 'on' ? 'solo admins' : 'todos'} puedan configurar el grupo.`
    const newlink = `🎋 El enlace del grupo ha sido restablecido.\n\n> ✧ Acción hecha por:\n> » ${usuario}`
    const status  = `🪄 El grupo ha sido ${p0 === 'on' ? '*cerrado*' : '*abierto*'} por ${usuario}\n\n> ✧ Ahora ${p0 === 'on' ? '*solo admins*' : '*todos*'} pueden enviar mensaje.`
    const admingp = `🎯 ${p0 ? `@${first(p0)}` : '@usuario'} ahora es admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`
    const noadmingp = `🏮 ${p0 ? `@${first(p0)}` : '@usuario'} deja de ser admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`

    
    switch (m.messageStubType) {
      
      case 21:
        await conn.sendMessage(m.chat, { text: nombre, mentions: [senderJid].filter(Boolean) }, { quoted: null })
        break

     
      case 22:
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [senderJid].filter(Boolean) }, { quoted: null })
        break

 
      case 23:
        await conn.sendMessage(m.chat, { text: newlink, mentions: [senderJid].filter(Boolean) }, { quoted: null })
        break

      
      case 25:
        await conn.sendMessage(m.chat, { text: edit, mentions: [senderJid].filter(Boolean) }, { quoted: null })
        break

    
      case 26:
        await conn.sendMessage(m.chat, { text: status, mentions: [senderJid].filter(Boolean) }, { quoted: null })
        break

    
      case 29: {
        const ms = Array.from(new Set([senderJid, p0].filter(Boolean)))
        await conn.sendMessage(m.chat, { text: admingp, mentions: ms }, { quoted: null })
        break
      }

    
      case 30: {
        const ms = Array.from(new Set([senderJid, p0].filter(Boolean)))
        await conn.sendMessage(m.chat, { text: noadmingp, mentions: ms }, { quoted: null })
        break
      }

     
      case 2:
        return

     
      default:
        console.log({
          messageStubType: m.messageStubType,
          messageStubParameters: m?.messageStubParameters || [],
          type: WAMessageStubType?.[m.messageStubType],
        })
    }
  } catch (err) {
    console.error('[_autodetect.before] error:', err?.message, { stub: m?.messageStubType })
   
  }
}

export default handler
