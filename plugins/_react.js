import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {

    if (!args || !args.length) {
        return m.reply(`${getBotEmoji(mePn)} Uso: ${usedPrefix + command} <link_post> <emoji1,emoji2,emoji3,emoji4>\n\nEjemplo:\n${usedPrefix + command} https://whatsapp.com/channel/0029Vb6D6ogBVJl60Yr8YL31/473 😨,🤣,👾,😳`)
    }

    await m.react('⏳')

    try {
        const parts = args.join(' ').split(' ')
        const postLink = parts[0]
        const reacts = parts.slice(1).join(' ')

        if (!postLink || !reacts) {
            return m.reply(`${getBotEmoji(mePn)} Formato incorrecto. Uso:\n${usedPrefix + command} <link> <emoji1,emoji2,emoji3,emoji4>`)
        }

        if (!postLink.includes('whatsapp.com/channel/')) {
            return m.reply(`${getBotEmoji(mePn)} El link debe ser de una publicación de canal de WhatsApp.`)
        }

        const emojiArray = reacts.split(',').map(e => e.trim()).filter(e => e)
        if (emojiArray.length > 4) {
            return m.reply(`${getBotEmoji(mePn)} Máximo 4 emojis permitidos.`)
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
            await m.reply(`${getBotEmoji(mePn)} ✅ Reacciones enviadas con éxito`)
        } else {
            await m.react('❌')
            await m.reply(`${getBotEmoji(mePn)} Error al enviar las reacciones`)
        }

    } catch (error) {
        await m.react('❌')
        await m.reply(`${getBotEmoji(mePn)} Error al procesar la solicitud`)
    }
}

handler.command = ['rea', 'react', 'reaccionar', 'channelreact']
export default handler
