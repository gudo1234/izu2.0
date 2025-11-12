import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const formatStylishReply = (msg) => `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`

  // Unir todo el texto después del comando
  const fullText = args.join(' ').trim()

  if (!fullText) {
    return m.reply(formatStylishReply(
      `Ingresa el link y los emojis.\n\nEjemplo:\n${usedPrefix + command} https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19 ❤️,😘,👍\n\nFormato:\n${usedPrefix + command} <link> <emojis>`
    ))
  }

  // Detectar URL válida
  const urlMatch = fullText.match(/(https?:\/\/[^\s]+)/)
  if (!urlMatch) {
    return m.reply(formatStylishReply(
      `No se encontró un enlace válido.\n\nEjemplo:\n${usedPrefix + command} https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19 ❤️,😘,👍`
    ))
  }

  const link = urlMatch[0]
  const emojis = fullText.replace(link, '').trim()

  if (!emojis) {
    return m.reply(formatStylishReply(
      `Faltan los emojis.\n\nEjemplo:\n${usedPrefix + command} ${link} ❤️,😘,👍`
    ))
  }

  let loadingMsg
  try {
    // Enviar mensaje de carga
    loadingMsg = await conn.sendMessage(m.chat, {
      text: formatStylishReply(`Enviando reacciones... ⚡\nLink: ${link}\nEmojis: ${emojis}\nPor favor espera...`)
    }, { quoted: m })

    // Llamar a la API
    const apiUrl = `https://obito-mr-apis.vercel.app/api/tools/like_whatssap?link=${encodeURIComponent(link)}&emoji=${encodeURIComponent(emojis)}`
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error(`API status: ${response.status}`)

    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'API response failed')

    // Borrar mensaje de carga
    await conn.sendMessage(m.chat, { delete: loadingMsg.key })

    // Enviar resultado
    await conn.sendMessage(m.chat, {
      text: formatStylishReply(
        `✅ ${data.message}\n\n📌 Enlace del canal:\n${data.channel_link}\n\n🎭 Emojis usados:\n${data.emoji}\n\n⚡ Engagement: +1.1k\n\n> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ`
      )
    }, { quoted: m })

  } catch (err) {
    console.error('❌ Error en xreact:', err)
    try { if (loadingMsg) await conn.sendMessage(m.chat, { delete: loadingMsg.key }) } catch {}

    let msg = 'Ocurrió un error inesperado.'
    if (err.message.includes('status')) msg = 'El servidor de reacciones no está respondiendo.'
    else if (err.message.includes('Network')) msg = 'Error de conexión de red.'
    else if (err.message.includes('API response failed')) msg = 'El servicio de engagement falló.'
    else msg = err.message

    await conn.sendMessage(m.chat, {
      text: formatStylishReply(`❌ Falló el envío de reacciones.\n\nError: ${msg}\n\n💡 Tips:\n• Verifica que el link sea válido\n• Asegúrate de separar los emojis con comas\n• El canal debe ser público\n• El API puede tener límite diario (200 usos)`)
    }, { quoted: m })
  }
}

//handler.command = /^xreact|engagement|autoreact|whatsappreact$/i
handler.command = ['re']
export default handler
