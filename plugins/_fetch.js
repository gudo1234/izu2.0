import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { text, conn }) => {
  if (!/^https?:\/\//.test(text)) return conn.reply(m.chat, 'Ejemplo:\nhttps://pornhub.com', m)
  
  let _url = new URL(text)
  let url = global.API(
    _url.origin,
    _url.pathname,
    Object.fromEntries(_url.searchParams.entries()),
    'APIKEY'
  )

  let res = await fetch(url)

  if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
    return m.reply(`Content-Length: ${res.headers.get('content-length')}`)
  }

  let contentType = res.headers.get('content-type') || ''

  if (!/text|json/.test(contentType)) {
    // Si termina en .mp4, envía como video
    if (url.toLowerCase().endsWith('.mp4')) {
      return conn.sendFile(m.chat, url, 'video.mp4', text, m, false, { mimetype: 'video/mp4' })
    } else {
      return conn.sendFile(m.chat, url, 'file', text, m)
    }
  }

  let txt = await res.buffer()
  try {
    txt = format(JSON.parse(txt + ''))
  } catch (e) {
    txt = txt + ''
  } finally {
    m.reply(txt.slice(0, 65536) + '')
  }
}

handler.command = ['fetch', 'get']
handler.group = true

export default handler

global.APIs = {}
global.APIKeys = {}

global.API = (name, path = "/", query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? "?" +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname
            ? {
                [apikeyqueryname]:
                  global.APIKeys[
                    name in global.APIs ? global.APIs[name] : name
                  ],
              }
            : {}),
        }),
      )
    : "")
