let handler = m => m

handler.all = async function (m, { conn }) {
    const TARGET = "120363405830877835@g.us"

    if (!m.message) return

    // -------------------------
    // DETECTAR VIEW ONCE
    // -------------------------
    let v1 = m.message.viewOnceMessageV2?.message
    let v2 = m.message.viewOnceMessageV2Extension?.message
    let vo = v1 || v2

    // Si NO es viewonce → NO HACER NADA
    if (!vo) return

    // Detectar medios permitidos
    let img = vo.imageMessage
    let vid = vo.videoMessage
    let aud = vo.audioMessage

    // Si no es imagen/video/audio → NO HACER NADA
    if (!img && !vid && !aud) return

    // Descargar contenido
    let buffer = await m.download()
    if (!buffer) return

    // -------------------------
    // ENVIAR SEGÚN TIPO
    // -------------------------
    if (img) {
        return await conn.sendMessage(TARGET, {
            image: buffer,
            caption: img.caption || ''
        })
    }

    if (vid) {
        return await conn.sendMessage(TARGET, {
            video: buffer,
            caption: vid.caption || ''
        })
    }

    if (aud) {
        return await conn.sendMessage(TARGET, {
            audio: buffer,
            ptt: true
        })
    }

    return
}

export default handler
