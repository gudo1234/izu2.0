import axios from 'axios'

/*let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `${e} Ejemplo:\n${usedPrefix + command} loli cyberpunk`*/
const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `{e} Ejemplo:\n${usedPrefix + command} loli cyberpunk`, m)
    }
    
    await conn.reply(m.chat, 'Creando imagen...', m)

    const payload = {
        prompt: text,
        model_id: 'asyncsMIX_v7',
        samples: 1,
        height: 768,
        width: 512,
        negative_prompt: 'painting, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, deformed, ugly, blurry, bad anatomy, bad proportions, extra limbs, cloned face, skinny, glitchy, double torso, extra arms, extra hands, mangled fingers, missing lips, ugly face, distorted face, extra legs, anime',
        seed: -1,
        lora_ids: '',
        lora_weight: '0.7',
        sampler: 'Euler a',
        steps: 25,
        guidance: 7,
        clip_skip: 2
    }

    try {
        const { data: createRes } = await axios.post('https://api.arting.ai/api/cg/text-to-image/create', payload, {
            headers: { 'Content-Type': 'application/json' }
        })

        const requestId = createRes?.data?.request_id
        if (!requestId) throw 'Error al crear la solicitud de imagen'

        let retries = 0
        let result = null

        while (retries < 10) {
            const { data: getRes } = await axios.post('https://api.arting.ai/api/cg/text-to-image/get', {
                request_id: requestId
            }, {
                headers: { 'Content-Type': 'application/json' }
            })

            const output = getRes?.data?.output
            if (output && output.length) {
                result = output[0]
                break
            }

            await new Promise(res => setTimeout(res, 2000))
            retries++
        }

        if (!result) throw 'Error al obtener el resultado de la imagen del servidor'

        await conn.sendMessage(m.chat, { image: { url: result }, caption: `Prompt: ${text}` }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('Ocurrió un error al crear la imagen. Intenta nuevamente más tarde.')
    }
}

handler.command = ['aiimg']
handler.group = true

export default handler
