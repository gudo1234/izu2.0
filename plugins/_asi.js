import axios from 'axios'
const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} = (await import("@whiskeysockets/baileys")).default

let handler = async (message, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(message.chat, "❕️ *¿QUÉ BÚSQUEDA DESEA REALIZAR EN TIKTOK?*", message)
  }

  async function createVideoMessage(url) {
    const { videoMessage } = await generateWAMessageContent(
      { video: { url } },
      { upload: conn.waUploadToServer }
    )
    return videoMessage
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  try {
    await conn.reply(message.chat, '⏳ *Buscando videos, espere un momento...*', message)

    const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`)

    if (!data.status || !data.result?.data?.length)
      return conn.reply(message.chat, '⚠️ No se encontraron resultados.', message)

    let searchResults = data.result.data
    shuffleArray(searchResults)
    let topResults = searchResults.slice(0, 7)

    let cards = []
    for (let result of topResults) {
      const videoUrl = result.nowm || result.play
      if (!videoUrl) continue

      const videoMsg = await createVideoMessage(videoUrl)

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: '✨ TikTok - HuTao-MD' }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: result.title || 'Sin título',
          hasMediaAttachment: true,
          videoMessage: videoMsg,
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Ver en TikTok',
                url: result.url || 'https://www.tiktok.com/',
                merchant_url: result.url || 'https://www.tiktok.com/',
              }),
            },
          ],
        }),
      })
    }

    const messageContent = generateWAMessageFromContent(
      message.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `🎬 *Resultados de:* ${text}`,
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: textbot,
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false,
              }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards,
              }),
            }),
          },
        },
      },
      { quoted: message }
    )

    await conn.relayMessage(message.chat, messageContent.message, {
      messageId: messageContent.key.id,
    })
  } catch (error) {
    console.error(error)
    conn.reply(message.chat, `❌️ *OCURRIÓ UN ERROR:* ${error.message}`, message)
  }
}

handler.command = ['si']
export default handler
