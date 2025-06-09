import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
  //const icono = 'https://i.pinimg.com/originals/88/3b/2e/883b2eb449fa9228f2b595bff00d95cd.jpg';

  try {
    const res = await fetch(icono);
    if (!res.ok) throw new Error('No se pudo descargar la imagen');

    const thumbnail = await res.buffer();
    console.log('[DEBUG] Thumbnail size:', thumbnail.length);

    await conn.sendMessage(m.chat, {
      productMessage: {
        product: {
          productImage: {
            mimetype: 'image/jpeg',
            jpegThumbnail: thumbnail
          },
          title: '🌌 Ryze MD ☠️',
          description: 'Producto generado por IA',
          currencyCode: 'MXN',
          priceAmount1000: 0,
          retailerId: 'Ryze MD',
          productImageCount: 1
        },
        businessOwnerJid: m.sender
      }
    }, { quoted: m });

  } catch (e) {
    console.error('[❌ ERROR FAKECATALOGO]', e);
    m.reply('❌ Ocurrió un error al enviar el catálogo.\n' + e.message);
  }
};

handler.command = /^fakecatalogo$/i;
export default handler;
