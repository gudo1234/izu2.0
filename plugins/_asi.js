import axios from 'axios'
import baileys from '@whiskeysockets/baileys'
const { proto, generateWAMessageFromContent, generateWAMessageContent } = baileys

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `${e} *¿Qué búsqueda deseas realizar en TikTok?*\n\nEjemplo:\n${usedPrefix + command} diles`, m)

  const createVideoMessage = async (url) => {
    const { videoMessage } = await generateWAMessageContent(
      { video: { url } },
      { upload: conn.waUploadToServer }
    )
    return videoMessage
  }

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  try {
    await conn.reply(m.chat, `${e} _*Espere un momento...*_`,m , rcanal)

    // Llamada a la API de Starlights Team
    const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`)
    if (!data.status || !data.result?.data?.length) return m.reply('⚠️ No se encontraron resultados.', m)

    let searchResults = data.result.data
    shuffleArray(searchResults)
    const topResults = searchResults.slice(0, 5)

    const cards = []
    for (const result of topResults) {
      const videoUrl = result.nowm || result.play
      if (!videoUrl) continue
      const videoMessage = await createVideoMessage(videoUrl)

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `🎵 ${result.author?.nickname || 'Autor desconocido'} • ❤️ ${result.stats?.diggCount || 0}` }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: result.title?.trim() || 'Sin título',
          hasMediaAttachment: true,
          videoMessage
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: []
        })
      })
    }

    const content = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🎬 Resultados de TikTok para: *${text}*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: textbot
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, content.message, { messageId: content.key.id })
  } catch (error) {
    console.error(error)
    conn.reply(m.chat, `❌ Ocurrió un error:\n${error.message}`, m)
  }
}

//handler.command = ['tiktoksearch', 'tts', 'tiktoks']
handler.command = ['si']
handler.group = true

export default handler
