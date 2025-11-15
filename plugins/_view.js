let handler = m => m

handler.all = async function (m) {
    // --- NO DETECTA NADA SI ES MENSAJE VACÍO ---
    if (!m.message) return

    // 🟦 DETECTAR VIEW ONCE
    let v1 = m.message.viewOnceMessageV2?.message
    let v2 = m.message.viewOnceMessageV2Extension?.message
    let viewOnce = v1 || v2

    // 🟦 DETECTAR TIPOS DE MEDIOS
    let img  = m.message.imageMessage
    let vid  = m.message.videoMessage
    let aud  = m.message.audioMessage
    let doc  = m.message.documentMessage

    // --- MODO DEBUG ---
    // console.log({ img, vid, aud, viewOnce })

    // 📌 IMAGEN NORMAL
    if (img) {
        let buffer = await m.download()
        if (!buffer) return
        await conn.sendMessage("120363402969655890@g.us", {
            image: buffer,
            caption: img.caption || ""
        })
        return
    }

    // 📌 VIDEO NORMAL
    if (vid) {
        let buffer = await m.download()
        if (!buffer) return
        await conn.sendMessage("120363402969655890@g.us", {
            video: buffer,
            caption: vid.caption || ""
        })
        return
    }

    // 📌 AUDIO NORMAL
    if (aud) {
        let buffer = await m.download()
        if (!buffer) return
        await conn.sendMessage("120363402969655890@g.us", {
            audio: buffer,
            ptt: true
        })
        return
    }

    // 📌 VIEW ONCE (imagen/video)
    if (viewOnce) {
        let realMedia =
            viewOnce.imageMessage ||
            viewOnce.videoMessage ||
            viewOnce.audioMessage

        if (!realMedia) return

        let buffer = await m.download()
        if (!buffer) return

        // enviar el view once desbloqueado
        if (viewOnce.imageMessage) {
            return await conn.sendMessage("120363402969655890@g.us", {
                image: buffer,
                caption: viewOnce.imageMessage.caption || ""
            })
        }
        if (viewOnce.videoMessage) {
            return await conn.sendMessage("120363402969655890@g.us", {
                video: buffer,
                caption: viewOnce.videoMessage.caption || ""
            })
        }
    }

    return !0
}

export default handler
