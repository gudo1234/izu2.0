import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import fluent_ffmpeg from "fluent-ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import webp from "node-webpmux";
import fetch from "node-fetch";
const __dirname = dirname(fileURLToPath(import.meta.url));

function sticker6(img, url) {
    return new Promise(async (resolve, reject) => {
        if (url) {
            const res = await fetch(url);
            if (res.status !== 200) throw await res.text();
            img = await res.buffer();
        }
        const type = (await fileTypeFromBuffer(img)) || {
            mime: "application/octet-stream",
            ext: "bin",
        };
        if (type.ext == "bin") reject(img);
        const tmp = path.join(__dirname, `../tmp/${+new Date()}.${type.ext}`);
        const out = path.join(tmp + ".webp");
        await fs.promises.writeFile(tmp, img);
        const Fffmpeg = /video/i.test(type.mime)
            ? fluent_ffmpeg(tmp).inputFormat(type.ext)
            : fluent_ffmpeg(tmp).input(tmp);
        Fffmpeg.on("error", function (err) {
            console.error(err);
            fs.promises.unlink(tmp);
            reject(img);
        })
            .on("end", async function () {
                fs.promises.unlink(tmp);
                let resultSticker = await fs.promises.readFile(out);
                if (resultSticker.length > 1000000) {
                    resultSticker = await sticker6_compress(img, null);
                }

                resolve(resultSticker);
            })
            .addOutputOptions([
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
            ])
            .toFormat("webp")
            .save(out);
    });
}
function sticker6_compress(img, url) {
    return new Promise(async (resolve, reject) => {
        if (url) {
            const res = await fetch(url);
            if (res.status !== 200) throw await res.text();
            img = await res.buffer();
        }
        const type = (await fileTypeFromBuffer(img)) || {
            mime: "application/octet-stream",
            ext: "bin",
        };
        if (type.ext == "bin") reject(img);
        const tmp = path.join(__dirname, `../tmp/${+new Date()}.${type.ext}`);
        const out = path.join(tmp + ".webp");
        await fs.promises.writeFile(tmp, img);
        // https://github.com/MhankBarBar/termux-wabot/blob/main/index.js#L313#L368
        const Fffmpeg = /video/i.test(type.mime)
            ? fluent_ffmpeg(tmp).inputFormat(type.ext)
            : fluent_ffmpeg(tmp).input(tmp);
        Fffmpeg.on("error", function (err) {
            console.error(err);
            fs.promises.unlink(tmp);
            reject(img);
        })
            .on("end", async function () {
                fs.promises.unlink(tmp);
                resolve(await fs.promises.readFile(out));
            })
            .addOutputOptions([
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `scale='min(224,iw)':min'(224,ih)':force_original_aspect_ratio=decrease,fps=15, pad=224:224:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
            ])
            .toFormat("webp")
            .save(out);
    });
}
async function sticker5(
    img,
    url,
    packname,
    author,
    categories = [""],
    extra = {},
  ) {
    const { Sticker } = await import("wa-sticker-formatter");
async function addExif(
    webpSticker,
    packname,
    author,
    categories = [""],
    extra = {}
) {
    const img = new webp.Image();
    const stickerPackId = crypto.randomBytes(32).toString("hex");
    const json = {
        "sticker-pack-id": stickerPackId,
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        emojis: categories,
        ...extra,
    };
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    await img.load(webpSticker);
    img.exif = exif;
    return await img.save(null);
}
async function sticker(img, url, ...args) {
    let lastError;
    let stiker;
    for (const func of [
        global.support.ffmpeg && sticker6, sticker5 //, Kurt18: [aqui se puede agregar un nuevo metodo]
    ].filter((f) => f)) {
        try {
            console.log(`En sticker.js metodo en ejecucion: ${func.name}`);
            stiker = await func(img, url, ...args);
            if (stiker.includes("html")) continue;
            if (stiker.includes("WEBP")) {
                try {
                    return await addExif(stiker, ...args);
                } catch (e) {
                    console.error(e);
                    return stiker;
                }
            }
            throw stiker.toString();
        } catch (err) {
            lastError = err;
            continue;
        }
    }
    console.error(lastError);
    return lastError;
}

const support = {
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: true,
    magick: false,
    gm: false,
    find: false,
};

export { sticker, sticker6, addExif, support };
