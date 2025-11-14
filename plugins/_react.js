import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {

    if (!args || !args.length) {
        return m.reply(`${e} Uso: ${usedPrefix + command} <link_post> <emoji1,emoji2,emoji3,emoji4>\n\nEjemplo:\n${usedPrefix + command} https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H/218 😨,🤣,👾,😳`)
    }

    await m.react('⏳')

    try {
        const parts = args.join(' ').split(' ')
        const postLink = parts[0]
        const reacts = parts.slice(1).join(' ')

        if (!postLink || !reacts) {
            return m.reply(`${e} Formato incorrecto. Uso:\n${usedPrefix + command} <link> <emoji1,emoji2,emoji3,emoji4>`)
        }

        if (!postLink.includes('whatsapp.com/channel/')) {
            return m.reply(`${e} El link debe ser de una publicación de canal de WhatsApp.`)
        }

        const emojiArray = reacts.split(',').map(e => e.trim()).filter(e => e)
        if (emojiArray.length > 4) {
            return m.reply(`${e} Máximo 4 emojis permitidos.`)
        }

        const apiKey = 'c44a9812537c7331c11c792314397e3179ab5774c606c8208be0dd7bd952d869'

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

        if (response.ok && result.message) {
            await m.react('✅')
            await m.reply(`${e} Reacciones enviadas con éxito`)
        } else {
            await m.react('❌')
            await m.reply(`${e} Error al enviar las reacciones`)
        }

    } catch (error) {
        await m.react('❌')
        await m.reply(`${e} Error al procesar la solicitud`)
    }
}

handler.command = ['rea', 'react', 'reaccionar', 'channelreact']
export default handler
