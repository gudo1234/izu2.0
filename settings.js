import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

global.botNumber = '' //Ejemplo: 50492280729

global.owner = [
   ['50492280729', '🍁̶͢͞▻⟅ẹ𝆊ϋ⟆٭⳺֟፝͜⳻٭.er/k', true],
   ['5212431268546'], ['50495351584'], ['58399391748107'], ['94880558792752']];

global.mods = ['50492280729']
global.suittag = ['50492280729'] 
global.prems = ['50492280729']

global.libreria = 'Baileys'
global.baileys = 'V 6.7.16' 
global.vs = '2.2.0'
global.nameqr = '🤖⃧►iʑυвöτ◃2.0▹'
global.namebot = '🤖⃧►iʑυвöτ◃2.0▹'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 
global.yukiJadibts = true
global.apiKey = 'stellar-8CQatPnA'

global.packname = '🤖⃧►iʑυвöτ◃2.0▹'
global.botname = '🤖⃧►iʑυвöτ◃2.0▹'
global.wm = '🤖⃧►iʑυвöτ◃2.0▹'
global.author = '🍁̶͢͞▻⟅ẹ𝆊ϋ⟆٭⳺֟፝͜⳻٭.er/k'
global.dev = '🍁̶͢͞▻⟅ẹ𝆊ϋ⟆٭⳺֟፝͜⳻٭.er/k'
global.textbot = 'Powered System WA-Bot © 2025'
global.etiqueta = '🍁̶͢͞▻⟅ẹ𝆊ϋ⟆٭⳺֟፝͜⳻٭.er/k'

global.imagen7 = fs.readFileSync('./media/ad.png')
global.imagen8 = fs.readFileSync('./media/byenavidad.jpg')
global.moneda = '¥enes'
global.welcom1 = '❍ Edita Con El Comando setwelcome'
global.welcom2 = '❍ Edita Con El Comando setbye'
global.banner = 'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me.jpg'
global.avatar = 'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me2.jpg'

global.gp1 = 'https://chat.whatsapp.com/KlFxtwHtqIWIWOTjnjqnu3' //꙳🧧𓆩ίʑ᭘ɱί-ⲃⲟτ𓆪🧧꙳
global.comunidad1 = 'https://chat.whatsapp.com/HHDvYPActKSDNgMB8bBJ9G' //comunidad
global.channel = 'https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H' //꙳🧧𓆩ίʑ᭘ɱί-ⲃⲟτ𓆪🧧꙳
global.channel2 = 'https://whatsapp.com/channel/0029Vb3os7zEFeXtsN5swC44' //➲౽໋ⲉⷡυⷪ᥉ࣰ֧ⷮ✰᮫݄݃🪴
global.md = '*Siganme en instagram:*\nhttps://www.instagram.com/edar504__'
global.correo = 'izumilitee@gmail.com'
global.cn ='https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H';

global.catalogo = fs.readFileSync('./src/catalogo.jpg');
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: packname, orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}
global.ch = {
ch1: "120363285614743024@newsletter"
} //꙳🧧𓆩ίʑ᭘ɱί-ⲃⲟτ𓆪🧧꙳
global.multiplier = 70

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})
