/*let handler = async (m, { conn, text, participants, groupMetadata }) => {
  try {
    const users = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid)

    const groupJid = m.chat
    const groupName = groupMetadata?.subject || 'este grupo'
    const groupMentionTag = `@${groupJid}`

    const message = text?.trim()
      ? `${groupMentionTag} *${text.trim()}*`
      : groupMentionTag

    await conn.sendMessage(m.chat, {
      text: message,
      mentions: users,
      contextInfo: {
        mentionedJid: users,
        groupMentions: [{
          groupJid: groupJid,
          groupSubject: groupName
        }]
      }
    })
  } catch (error) {
    console.error('Error en comando .everyone:', error)
    await m.reply(`${e} Ocurrió un error al ejecutar el comando.`)
  }
}

handler.command = ['everyone']
handler.admin = true
handler.group = true

export default handler*/

let handler = async (m, { conn, text, participants, groupMetadata }) => {
	try {
		const users = (participants || [])
			.map(u => u.id)
			.filter(v => v && v !== conn.user.jid)

		const groupJid = m.chat
		const groupName = text?.trim() || groupMetadata?.subject || 'everyone'

		const header = '乂 M E N S A J E 乂'
		const groupMentionTag = `@${groupJid}`
		const membersHeader = '乂 M I E M B R O S 乂'
		const listaUsuarios = users.length
			? users.map(id => `@${id.split('@')[0]}`).join('\n')
			: 'No hay usuarios para mencionar.'

		//const message = `${header}\n${groupMentionTag}\n\n${membersHeader} (${users.length})\n${listaUsuarios}`
        const message = `@${groupJid}`
		const style = typeof rcanalr === 'object' ? rcanalr : (typeof rcanal === 'object' ? rcanal : {})
		const externalAdReply = style?.contextInfo?.externalAdReply

		const payload = {
			text: message,
			mentions: users, 
			contextInfo: {
				mentionedJid: users,
				groupMentions: [{
					groupJid: groupJid,
					groupSubject: groupName
				}],
				...(externalAdReply ? { externalAdReply } : {})
			}
		}

		let fancyQuoted = await makeFkontak('Lista de Miembros')
		if (!fancyQuoted && m.quoted) fancyQuoted = m.quoted
		else if (!fancyQuoted) fancyQuoted = m

		await conn.sendMessage(m.chat, payload, { quoted: null })
	} catch (error) {
		console.error('Error en comando .everyone:', error)
		await m.reply('⚠️ Ocurrió un error al ejecutar el comando.')
	}
}

handler.command = ['everyone']
 handler.admin = true
handler.group = true

export default handler

async function makeFkontak(nombre = 'Broadcast') {
	try {
		let thumb
		try {
			const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
			if (res.ok) {
				const arr = await res.arrayBuffer()
				thumb = Buffer.from(arr)
			}
		} catch {}

		return {
			key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'TAGALL' },
			message: { locationMessage: { name: nombre, jpegThumbnail: thumb } },
			participant: '0@s.whatsapp.net'
		}
	} catch {
		return undefined
	}
                                   }
