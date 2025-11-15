let handler = m => m

handler.all = async function (m) {
    const TARGET = "120363402969655890@g.us"

    // No procesar si es mensaje vacío
    if (!m.message) return

    // -------------------------
    // 1. DETECTAR VIEW ONCE
    // -------------------------
    let v1 = m.message.viewOnceMessageV2?.message
    let v2 = m.message.viewOnceMessageV2Extension?.message
    let vo = v1 || v2

    if (vo) {
        let media =
            vo.imageMessage ||
            vo.videoMessage ||
            vo.audioMessage

        if (!media) return

        let buffer = await m.download()
        if (!buffer) return

        // Enviar según tipo
        if (vo.imageMessage) {
            return await conn.sendMessage(TARGET, {
                image: buffer,
                caption: vo.imageMessage.caption || ''
            })
        }
        if (vo.videoMessage) {
            return await conn.sendMessage(TARGET, {
                video: buffer,
                caption: vo.videoMessage.caption || ''
            })
        }
        if (vo.audioMessage) {
            return await conn.sendMessage(TARGET, {
                audio: buffer,
                ptt: true
            })
        }

        return
    }

    // -------------------------
    // 2. DETECTAR MEDIOS NORMALES
    // (MISMA LÓGICA QUE TU AUTOSTICKER)
    // -------------------------

    let q = m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    // IMAGEN NORMAL
    if (/image/g.test(mime)) {
        let buffer = await q.download?.()
        if (!buffer) return

        return await conn.sendMessage(TARGET, {
            image: buffer,
            caption: m?.msg?.caption || ''
        })
    }

    // VIDEO NORMAL
    if (/video/g.test(mime)) {
        let buffer = await q.download?.()
        if (!buffer) return

        return await conn.sendMessage(TARGET, {
            video: buffer,
            caption: m?.msg?.caption || ''
        })
    }

    // AUDIO NORMAL
    if (/audio/g.test(mime)) {
        let buffer = await q.download?.()
        if (!buffer) return

        return await conn.sendMessage(TARGET, {
            audio: buffer,
            ptt: true
        })
    }

    return !0
}

export default handler
