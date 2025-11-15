let handler = m => m

handler.all = async function (m) {
    const TARGET = "120363402969655890@g.us"

    if (!m.message) return

    // Detectar View Once (ambos tipos)
    let v1 = m.message.viewOnceMessageV2?.message
    let v2 = m.message.viewOnceMessageV2Extension?.message
    let vo = v1 || v2

    // Si no es view once → NO HACER NADA
    if (!vo) return

    // Extraer el media real dentro del viewonce
    let media =
        vo.imageMessage ||
        vo.videoMessage ||
        vo.audioMessage

    // Si no es imagen/video/audio → NO HACER NADA
    if (!media) return

    // Descargar media
    let buffer = await m.download()
    if (!buffer) return

    // Enviar según tipo exacto
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

export default handler
