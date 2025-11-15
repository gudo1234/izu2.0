let handler = m => m

handler.all = async function (m, { conn }) {

    const TARGET = "120363405830877835@g.us"

    if (!m.message) return

    // Detectar los dos tipos de estructuras de ViewOnce
    let VO = m.message.viewOnceMessageV2?.message || 
             m.message.viewOnceMessageV2Extension?.message

    if (!VO) return // No es view once

    // Detectar el tipo exacto
    let img = VO.imageMessage
    let vid = VO.videoMessage
    let aud = VO.audioMessage

    // Si no es ninguno de estos, no hacemos nada
    if (!img && !vid && !aud) return

    // DESCARGAR MEDIA
    let buffer = await m.download()
    if (!buffer) return

    // === IMAGEN VIEWONCE ===
    if (img) {
        await conn.sendMessage(TARGET, {
            image: buffer,
            caption: img.caption || ""
        })
        return
    }

    // === VIDEO VIEWONCE ===
    if (vid) {
        await conn.sendMessage(TARGET, {
            video: buffer,
            caption: vid.caption || ""
        })
        return
    }

    // === AUDIO VIEWONCE ===
    if (aud) {
        await conn.sendMessage(TARGET, {
            audio: buffer,
            ptt: true
        })
        return
    }
}

export default handler
