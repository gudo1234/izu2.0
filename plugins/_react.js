import fetch from 'node-fetch'

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`${e} Uso correcto: 
${usedPrefix + command} <link_post> <emoji1,emoji2,emoji3,emoji4>

Ejemplo: 
${usedPrefix + command} https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H/218 😨,🤣,👾,😳`)
  }

  await m.react('🕒')

  try {
    const parts = args.join(' ').split(' ')
    const postLink = parts[0]
    const reacts = parts.slice(1).join(' ')

    if (!postLink || !reacts)
      return m.reply(`🐢 Formato incorrecto. Uso: ${usedPrefix + command} <link> <emoji1,emoji2,emoji3,emoji4>`)

    if (!postLink.includes('whatsapp.com/channel/'))
      return m.reply('🍄 El link debe ser de una publicación de canal de WhatsApp.')

    const emojiArray = reacts.split(',').map(e => e.trim()).filter(e => e)
    if (emojiArray.length > 4)
      return m.reply('👻 Máximo 4 emojis permitidos.')

    const apiKey = '76b423a82b517e0cf9b63633432529e6e494db7f84bd1ebd6a6ebd92309f36aa'

    const requestData = {
      post_link: postLink,
      reacts: emojiArray.join(',')
    }

    const response = await fetch('https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0',
        'Referer': 'https://asitha.top/channel-manager'
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json()

    if (response.ok && result?.message) {
      await m.react('✅')
      await m.reply('✅ Reacciones enviadas con éxito.')
    } else {
      await m.react('❌')
      await m.reply('❌ Error al enviar las reacciones.')
    }
  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('❌ Error al procesar la solicitud.')
  }
}

handler.command = ['react', 're', 'rea']

export default handler
