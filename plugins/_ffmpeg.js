import ffmpeg from 'fluent-ffmpeg'

try {
  await new Promise((resolve, reject) => {
    ffmpeg('input.mp4') // ajusta según tu input
      .output('output.mp4') // ajusta según tu output
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
} catch (e) {
  let errorMsg = `❌ Error al procesar con ffmpeg:\n${e.message}`
  console.error(errorMsg)

  await conn.reply(m.chat, errorMsg, m)
  await conn.reply(OWNER_JID, errorMsg, null, {
    contextInfo: { mentionedJid: [m.sender] }
  })
}
