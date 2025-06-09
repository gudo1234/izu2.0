import axios from 'axios';

const handler = async (m, { conn }) => {
  const imageUrl = icono;

  try {
    const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data);

    await conn.sendMessage(m.chat, {
      productMessage: {
        product: {
          productImage: {
            mimetype: 'image/jpeg',
            jpegThumbnail: buffer,
          },
          title: '🌌 Ryze MD ☠️',
          description: 'Producto generado por IA',
          currencyCode: 'MXN',
          priceAmount1000: 0,
          retailerId: 'Ryze MD',
          productImageCount: 1,
        },
        businessOwnerJid: conn.decodeJid(conn.user.id) || m.sender, // respaldo si falla
      },
    }, { quoted: m });
  } catch (e) {
    console.error('[ERROR EN FAKECATALOGO]', e);
    await m.reply('❌ Ocurrió un error al enviar el catálogo.');
  }
};

handler.command = ['fakecatalogo']
export default handler;
