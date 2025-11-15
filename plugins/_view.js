import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let yaIniciado = false

let handler = async (m, { conn }) => {
  // Solo ejecutar una vez para iniciar el listener
  if (yaIniciado) return
  yaIniciado = true

  // Grupo donde se reenviarán los ViewOnce automáticamente
  const TARGET_GROUP = '120363402969655890@g.us'

  // Escuchar todos los mensajes nuevos
  conn.ev.on('messages.upsert', async ({ messages }) => {
    for (let m of messages) {
      if (!m.message) continue
      if (!m.key.remoteJid) continue

      // Solo en el grupo deseado
      if (m.key.remoteJid !== TARGET_GROUP) continue

      // Detectar ViewOnce
      const msgKeys = Object.keys(m.message)
      const isViewOnce = msgKeys.some(k => m.message[k]?.viewOnce)

      if (!isViewOnce) continue

      let buffer
      try {
        // Descarga el contenido viewOnce
        const typeKey = msgKeys.find(k => m.message[k]?.viewOnce)
        buffer = await downloadContentFromMessage(m.message[typeKey], 'buffer')
      } catch {
        continue
      }

      // Determinar tipo de mensaje
      const typeKey = msgKeys.find(k => m.message[k]?.viewOnce)
      const quoted = m.message[typeKey]

      try {
        if (/videoMessage/.test(typeKey)) {
          await conn.sendFile(TARGET_GROUP, buffer, 'media.mp4', quoted.caption || '')
        } else if (/imageMessage/.test(typeKey)) {
          await conn.sendFile(TARGET_GROUP, buffer, 'media.jpg', quoted.caption || '')
        } else if (/audioMessage/.test(typeKey)) {
          await conn.sendMessage(TARGET_GROUP, buffer, {
            type: 'audioMessage',
            ptt: true
          })
        }
      } catch (err) {
        console.log('Error reenviando ViewOnce:', err)
      }
    }
  })
}

export default handler
