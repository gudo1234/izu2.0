import PhoneNumber from 'awesome-phonenumber'

/**
 * Comando .io
 * - .io @usuario -> expulsa al usuario mencionado
 * - .io 212 -> expulsa a todos los usuarios cuyo número real comienza con +212 (si es posible resolver el número)
 *
 * Nota: El código intenta múltiples estrategias para extraer el número real sin mostrarlo nunca.
 */
let handler = async (m, { conn, participants, args, usedPrefix, command }) => {
  // === 🧩 FUNCIÓN PARA BURLAR EL LID ===
  let sender = ''
  if (m.key.fromMe) {
    sender = conn.user?.jid || conn.user?.id || (conn.user?.lid?.split(':')[0] + '@lid') || ''
  } else if (m.participant) {
    sender = m.participant
  } else if (m.key.participant) {
    sender = m.key.participant
  } else if (m.key.remoteJid?.endsWith('@g.us')) {
    sender = m.sender || m.key.participant || ''
  } else {
    sender = m.key.remoteJid || m.sender || ''
  }
  if (!sender && m.sender) sender = m.sender
  if (!sender && m.chat && !m.isGroup) sender = m.chat

  let response = {}

  if (m.isGroup) {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null) || {}
    response.metadata = metadata

    response.admins = metadata.participants?.filter(p => p.admin)?.map(p => ({
      id: p.id || p.jid,
      admin: p.admin
    })) || []

    const user = metadata.participants?.find(u => (u.id || u.jid) === sender) || {}
    response.isRAdmin = user.admin === 'superadmin'
    response.isAdmin = response.isRAdmin || user.admin === 'admin'
    response.isBotAdmin = response.admins.some(a =>
      a.id === conn.user.jid ||
      a.id === conn.user?.id ||
      a.id === (conn.user?.lid?.split(':')[0] + '@lid')
    )
  }

  if (sender?.endsWith('@lid')) {
    const match = response.metadata?.participants?.find(
      p => p.id === sender || p.jid === sender
    )
    if (match) sender = match.jid || match.id
  }

  response.sender = sender

  // === 🧩 VARIABLES DE GRUPO Y ADMINS ===
  const groupInfo = response.metadata || (await conn.groupMetadata(m.chat))
  const ownerGroup = groupInfo.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`
  const ownerBot = `${global.owner?.[0]?.[0] || '0'}@s.whatsapp.net`
  const admins = groupInfo.participants?.filter(p => p.admin).map(p => p.id) || []

  // === 🧍‍♂️ Usuario aleatorio para ejemplo ===
  const candidates = groupInfo.participants.filter(p =>
    p.id !== conn.user.jid &&
    p.id !== ownerGroup &&
    p.id !== ownerBot
  )
  const randomUser = candidates[Math.floor(Math.random() * candidates.length)]?.id || 'usuario@s.whatsapp.net'

  const e = '🚫'

  // === 💬 Si hay menciones o mensaje citado ===
  if ((m.mentionedJid && m.mentionedJid.length) || m.quoted) {
    const user = m.mentionedJid ? m.mentionedJid[0] : (m.quoted && m.quoted.sender)

    if (user === conn.user.jid)
      return conn.reply(m.chat, `${e} No puedo eliminarme yo (bot) del grupo.`, m)

    if (user === ownerGroup)
      return conn.reply(m.chat, `${e} No puedo eliminar al propietario del grupo.`, m)

    if (user === ownerBot)
      return conn.reply(m.chat, `${e} No puedo eliminar al propietario del bot.`, m)

    if (admins.includes(user))
      return conn.reply(m.chat, `${e} No puedo eliminar a otro administrador del grupo.`, m)

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    return
  }

  // === 🔢 UTIL: intentar resolver número real desde un participante (sin mostrarlo) ===
  const resolveNumberFromParticipant = (p) => {
    try {
      // 1) Campos directos que suelen existir
      const tryFields = [
        p.id,               // ej: '521234567890@s.whatsapp.net' o '1234abcd@lid' o '12345678:1@s.whatsapp.net'
        p.jid,              // a veces p.jid existe
        p.user,             // en algunos entornos
        p[0],               // por si es array
        (conn && conn.contacts && conn.contacts[p.id] && conn.contacts[p.id].vname) || '',
        (conn && conn.contacts && conn.contacts[p.id] && conn.contacts[p.id].notify) || '',
        (conn && conn.store && conn.store.contacts && conn.store.contacts[p.id] && conn.store.contacts[p.id].vname) || '',
        (conn && conn.store && conn.store.contacts && conn.store.contacts[p.id] && conn.store.contacts[p.id].notify) || '',
        p.name || '',
        p.notify || '',
        p.verifiedName || '',
      ].filter(Boolean)

      // 2) por cada candidate, extraer secuencia de dígitos razonable
      for (const field of tryFields) {
        if (!field) continue
        // Convertir a string y limpiar
        const s = String(field)
        // Si el campo contiene un '@', tome la parte izquierda (JID)
        const left = s.split('@')[0]
        // Si tiene ':' (format LID), tome la parte antes de ':' también
        const left2 = left.split(':')[0]
        // Extraer dígitos contiguos largos (mínimo 6 para evitar falsos positivos)
        const digitMatch = left2.match(/\d{6,15}/g)
        if (digitMatch && digitMatch.length) {
          // Tomamos el primer match (más probable)
          const digits = digitMatch[0]
          // Normalizar con awesome-phonenumber (si falla, devolvemos el +digits)
          try {
            const pn = new PhoneNumber('+' + digits)
            const e164 = pn.getNumber('e164')
            if (e164) return e164
            return '+' + digits
          } catch {
            return '+' + digits
          }
        }

        // Si no hay dígitos contiguos, a veces el número viene mezclado en texto (notify/vname)
        const anyDigits = s.replace(/\D/g, '')
        if (anyDigits.length >= 6 && anyDigits.length <= 15) {
          try {
            const pn = new PhoneNumber('+' + anyDigits)
            const e164 = pn.getNumber('e164')
            if (e164) return e164
            return '+' + anyDigits
          } catch {
            return '+' + anyDigits
          }
        }
      }
    } catch (e) {
      // swallow
    }
    return '' // no se pudo resolver
  }

  // === 🔢 Si se pasa un prefijo numérico ===
  if (args[0] && !isNaN(args[0])) {
    const prefix = String(args[0]).replace(/\D/g, '') // '212'
    const targets = []

    for (const p of groupInfo.participants) {
      try {
        // excluir propietarios/adm/bot
        if (
          p.id === conn.user.jid ||
          p.id === ownerGroup ||
          p.id === ownerBot ||
          admins.includes(p.id)
        ) continue

        // Intentar resolver número real
        const real = resolveNumberFromParticipant(p) // ej: '+2126xxxxxxx' o ''
        if (real && real.startsWith('+' + prefix)) {
          targets.push(p.id)
        }
      } catch (err) {
        // ignorar ese participante
        continue
      }
    }

    if (targets.length === 0)
      return conn.reply(m.chat, `${e} *No se encontró ningún miembro con el prefijo* ${prefix} *que pueda ser expulsado.*`, m)

    await conn.reply(m.chat, `*Expulsando a ${targets.length} usuario(s) con el prefijo ${prefix}...*`, m)

    for (let id of targets) {
      await conn.groupParticipantsUpdate(m.chat, [id], 'remove').catch(() => null)
      // retraso entre expulsiones para evitar rate-limit
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    return conn.reply(m.chat, '*Expulsión finalizada.*', m)
  }

  // === 📢 Mensaje de ayuda ===
  return conn.reply(m.chat,
    `${e} *Ejemplos de uso:*\n` +
    `✑ _Para expulsar a un usuario usa:_ \`${usedPrefix + command}\` @${randomUser.split('@')[0]}\n` +
    `> Para expulsar a todos los usuarios cuyo número comienza con un prefijo específico: *${usedPrefix + command} <prefijo>*\n\n` +
    `*Ejemplo:* \`${usedPrefix + command}\` 212 (esto expulsará a todos los usuarios cuyo número comience con +212)`,
    m,
    { mentions: [randomUser] }
  )
}

handler.command = ['io']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
