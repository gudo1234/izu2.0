import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  try {
    if (!text) {
      return m.reply(`${e} *Uso correcto del comando*\n\nEjemplos:\n\n` +
        `📌 .ta https://chat.whatsapp.com/XYZ123|texto|Hola grupo\n` +
        `📸 .ta https://chat.whatsapp.com/XYZ123|imagen|https://servidor.com/img.jpg|Hola a todos\n` +
        `🎬 .ta https://chat.whatsapp.com/XYZ123|video|https://servidor.com/vid.mp4|Saludos!`)
    }

    // Separar parámetros
    let [invite, formato, extra1, extra2] = text.split('|')
    if (!invite) return m.reply(`${e} Ingresa un enlace de grupo válido.`)
    if (!formato) return m.reply(`${e} Indica el formato: texto, imagen o video.`)

    // Extraer el código del enlace
    let code = invite.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
    if (!code) return m.reply(`${e} Enlace de grupo no válido.`)

    // Intentar unirse al grupo
    let res = await conn.groupAcceptInvite(code[1]).catch(() => null)
    if (!res) return m.reply(`${e} No pude unirme al grupo. El enlace puede estar vencido o ser privado.`)

    // Obtener info del grupo
    let groupMetadata = await conn.groupMetadata(res).catch(() => null)
    if (!groupMetadata) return m.reply(`${e} No se pudo obtener la información del grupo.`)

    let participants = groupMetadata.participants.map(v => v.id)
    let caption = formato.toLowerCase() === 'texto' ? extra1 : extra2

    switch (formato.toLowerCase()) {
      case 'texto':
        await conn.sendMessage(res, { 
          text: caption || ' ', 
          mentions: participants 
        })
        break

      case 'imagen':
        if (!extra1) return m.reply(`${e} Falta la URL de la imagen.`)
        var img = await fetch(extra1).then(v => v.buffer())
        await conn.sendMessage(res, {
          image: img,
          caption: caption || '',
          mentions: participants
        })
        break

      case 'video':
        if (!extra1) return m.reply(`${e} Falta la URL del video.`)
        var vid = await fetch(extra1).then(v => v.buffer())
        await conn.sendMessage(res, {
          video: vid,
          caption: caption || '',
          mentions: participants
        })
        break

      default:
        return m.reply(`${e} Formato no válido. Usa: texto | imagen | video.`)
    }

    await conn.sendMessage(m.chat, { 
      text: `✅ Mensaje enviado correctamente al grupo *${groupMetadata.subject}* (${participants.length} miembros).\n\n📌 El bot permanecerá en el grupo.`
    })

  } catch (err) {
    console.error(err)
    m.reply(`${e} Hubo un error al ejecutar el comando.`)
  }
}

// Permite uso en grupos y privado
handler.command = ['ta']
handler.group = true
handler.private = true

export default handler
