/*import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.reply(m.chat, `${e} Genera una imagen con la ia.\n*Ejemplo:* \`${usedPrefix + command}\` loli cyberpunk`, m)
  }

  try {
    m.react('🕒')

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

    // Crear la imagen
    const { data: createRes } = await axios.post('https://api.arting.ai/api/cg/text-to-image/create', payload, {
      headers: { 'Content-Type': 'application/json' }
    })

    const requestId = createRes?.data?.request_id
    if (!requestId) throw new Error('No se pudo obtener request_id de la API')

    // Esperar resultado de la imagenn
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

    if (!result) throw new Error('La generación de imagen falló o tomó demasiado tiempo')
    m.react('✅')
    await conn.sendFile(m.chat, result, "Thumbnail.jpg", `*Prompt:* ${text}`, m, null, rcanal)

  } catch (err) {
    console.error(err)
    m.reply('Ocurrió un error al generar la imagen. Intenta de nuevo más tarde.')
  }
}

handler.command = ['aiimg']
handler.group = true

export default handler*/

import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.reply(m.chat, `${e} Genera una imagen con la IA.\n*Ejemplo:* \`${usedPrefix + command}\` loli cyberpunk`, m)
  }

  m.react('🕒')

  const prompt = text.trim()

  const generateWithArting = async () => {
    const payload = {
      prompt,
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

    const { data: createRes } = await axios.post('https://api.arting.ai/api/cg/text-to-image/create', payload, {
      headers: { 'Content-Type': 'application/json' }
    })

    const requestId = createRes?.data?.request_id
    if (!requestId) throw new Error('No se pudo obtener request_id de la API principal')

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

    if (!result) throw new Error('La generación de imagen falló o tomó demasiado tiempo [Arting]')
    return result
  }

  const generateWithExoml = async () => {
    const { data } = await axios.post('https://gpt1image.exomlapi.com/v1/images/generations', {
      prompt,
      size: '512x768',
      model: 'midjourney',
      n: 1
    }, {
      headers: { 'Content-Type': 'application/json' }
    })

    const imageUrl = data?.data?.[0]?.url
    if (!imageUrl) throw new Error('No se pudo obtener imagen de la API de respaldo')
    return imageUrl
  }

  try {
    let imageUrl = await generateWithArting()
    m.react('✅')
    await conn.sendFile(m.chat, imageUrl, "Thumbnail.jpg", `*Prompt:* ${prompt}`, m, null, rcanal)
  } catch (err) {
    console.error('[❌ Arting AI Error]', err.message)

    try {
      let imageUrl = await generateWithExoml()
      m.react('✅')
      await conn.sendFile(m.chat, imageUrl, "Thumbnail.jpg", `*Prompt:* ${prompt}*\n_Usando API de respaldo_`, m, null, rcanal)
    } catch (fallbackErr) {
      console.error('[❌ Exoml Fallback Error]', fallbackErr.message)
      m.reply('Ocurrió un error al generar la imagen con ambas APIs. Intenta de nuevo más tarde.')
    }
  }
}

handler.command = ['aiimg']
handler.group = true

export default handler
