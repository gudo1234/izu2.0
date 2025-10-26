
const {
  proto,
  generateWAMessage,
  areJidsSameUser,
 
} = (await import('@whiskeysockets/baileys')).default

export async function all(m, chatUpdate) {
  try {
    
    if (m?.isBaileys) return
    if (!m?.message) return

    const hasInteractive =
      m.message.buttonsResponseMessage ||
      m.message.templateButtonReplyMessage ||
      m.message.listResponseMessage ||
      m.message.interactiveResponseMessage

    if (!hasInteractive) return

    
    const safeStr = v => (typeof v === 'string' ? v : v == null ? '' : String(v))
    const safeJson = s => {
      try {
        return JSON.parse(typeof s === 'string' ? s : '{}')
      } catch {
        return {}
      }
    }

   
    let id =
      m.message.buttonsResponseMessage?.selectedButtonId ??
      m.message.templateButtonReplyMessage?.selectedId ??
      m.message.listResponseMessage?.singleSelectReply?.selectedRowId ??
      safeJson(m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson).id ??
      ''

    id = safeStr(id)

    
    let text =
      m.message.buttonsResponseMessage?.selectedDisplayText ??
      m.message.templateButtonReplyMessage?.selectedDisplayText ??
      m.message.listResponseMessage?.title ??
      m.message.interactiveResponseMessage?.body?.text ??
      ''

    text = safeStr(text)

    
    if (!id && !text) return


    let isIdMessage = false
    let usedPrefix = ''
    for (const name in global.plugins) {
      const plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue
      if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) continue
      if (typeof plugin !== 'function') continue
      if (!plugin.command) continue

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      const _prefix =
        plugin.customPrefix ??
        (this && this.prefix ? this.prefix : global.prefix)

      const candidates =
        _prefix instanceof RegExp
          ? [[_prefix.exec(id), _prefix]]
          : Array.isArray(_prefix)
          ? _prefix.map(p => {
              const re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
              return [re.exec(id), re]
            })
          : typeof _prefix === 'string'
          ? [[new RegExp(str2Regex(_prefix)).exec(id), new RegExp(str2Regex(_prefix))]]
          : [[null, new RegExp()]]

      
      const match = candidates.find(p => p[0])
      usedPrefix = safeStr(match?.[0]?.[0])

      if (usedPrefix) {
        const noPrefix = id.replace(usedPrefix, '')
        let [command] = safeStr(noPrefix).trim().split(/\s+/).filter(Boolean)
        command = safeStr(command).toLowerCase()

        const isId =
          plugin.command instanceof RegExp
            ? plugin.command.test(command)
            : Array.isArray(plugin.command)
            ? plugin.command.some(cmd => (cmd instanceof RegExp ? cmd.test(command) : cmd === command))
            : typeof plugin.command === 'string'
            ? plugin.command === command
            : false

        if (!isId) continue
        isIdMessage = true
        break
      }
    }

    
    const payloadText = safeStr(isIdMessage ? id : text) 
    const mentions = Array.isArray(m.mentionedJid) ? m.mentionedJid.filter(Boolean) : []

    const messages = await generateWAMessage(
      m.chat,
      {
        text: payloadText,
        mentions,
      },
      {
        userJid: this.user.id,
        quoted: m?.quoted?.fakeObj,
      }
    )

    messages.key.fromMe = areJidsSameUser(m.sender, this.user.id)
    messages.key.id = m.key.id
    messages.pushName = m.name
    if (m.isGroup) messages.key.participant = (messages.participant = m.sender)

    const msg = {
      ...chatUpdate,
      messages: [proto.WebMessageInfo.fromObject(messages)].map(v => ((v.conn = this), v)),
      type: 'append',
    }

    this.ev.emit('messages.upsert', msg)
  } catch (error) {
    console.error('[templateResponse.all] Error:', error?.message, { mid: m?.key?.id })
  }
}
