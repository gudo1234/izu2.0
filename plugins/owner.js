import fetch from 'node-fetch';
function handler(m) {
const thumbnail = await (await fetch(icono)).buffer()
const emojis = ['🍎', '🍒', '🍉', '🍊', '🍋', '🍏', '🍌', '🍍', '🍓', '🍇', '🍈', '🍒', '🍑', '🥭', '🍐', '🥥', '🍋‍🟩'];
    for (let i = 0; i < emojis.length; i++) {
        setTimeout(async () => {
            await m.react(emojis[i]);
        }, i * 1000);
    }
conn.sendMessage(m.chat, {
  contacts: {
    contacts: [{
      displayName: author,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Edar;;;\nFN:―͟͞🍁͓̽𝆥⟅ₑᵤ⟆𝇃𝇄⳻݊͜⳺𝇄𝇃\nORG:izuBot Owner\nTITLE: Developer\nTEL;type=CELL;type=VOICE;waid=50492280729:+504 9228 0727\nTEL;type=WORK;type=VOICE:+504 9228 0729\nEMAIL: izumilitee@gmail.com\nADR;type=WORK:;;Por el dia no hago nada y por la tarde descanso;;;;\nURL:https://www.instagram.com/edar504__\nNOTE:xd.\nBDAY:2025-12-31\nPHOTO;VALUE=URI:https://mystickermania.com/cdn/stickers/cute/mochi-peach-cat-bread-512x512.png\nEND:VCARD`
    }]
  },
 contextInfo: {
"externalAdReply": {
"renderLargerThumbnail": true,
"mediaType": 1,
"title": 'No molestar, xD -_-',
"body": wm,
"thumbnailUrl": redes,
"thumbnail": thumbnail,
sourceUrl: redes
}
}
}, {
  quoted: m
});
}
handler.customPrefix = /^(Edar|edar|@50492280729|.owner|owner|.dueño|dueño|.creador|creador)$/i
handler.command = new RegExp 

export default handler
