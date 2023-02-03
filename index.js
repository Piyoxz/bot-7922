const { default: makeWASocket, DisconnectReason, downloadContentFromMessage, useMultiFileAuthState, makeInMemoryStore } = require('@adiwajshing/baileys')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const qrcode = require('qrcode')
const fs = require('fs-extra')
const Monitor = require('ping-monitor');
const FormData = require('form-data')
const fetch = require('node-fetch')
const { fromBuffer } = require('file-type')
const imgu = require('img-to-url');
const monitor = new Monitor({
  website: 'https://bot31.piyoxz.repl.co',
  title: 'piyo',
  interval: 2
});

const uploadImages = (buffData, fileName) => {
    return new Promise(async (resolve, reject) => {
        const filePath = `./${fileName}.jpg`
        fs.writeFile(filePath, buffData, { encoding: 'base64' }, (err) => {
            if (err) reject(err)
            console.log('Uploading image to telegra.ph server...')
            const fileData = fs.readFileSync(filePath)
            const form = new FormData()
            form.append('file', fileData, `${fileName}.jpg`)
            fetch('https://telegra.ph/upload', {
                method: 'POST',
                body: form
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result.error) reject(result.error)
                    resolve('https://telegra.ph' + result[0].src)
                })
                .then(() => fs.unlinkSync(filePath))
                .catch((err) => reject(err))
        })
    })
}

monitor.on('up', (res) => console.log(`${res.website} its on.`));
monitor.on('down', (res) => console.log(`${res.website} it has died - ${res.statusMessage}`));
monitor.on('stop', (website) => console.log(`${website} has stopped.`));
monitor.on('error', (error) => console.log(error));

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

store.readFromFile('./baileys_store1.json')
setInterval(() => {
  store.writeToFile('./baileys_store1.json')
}, 10_000)
require("http").createServer((_, res) => res.end("Uptime!")).listen(3000, '0.0.0.0', function() {
  console.log('Listening on port %d', 3000);
});
async function main() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const conn = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    getMessage: async key => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
      }

      // only if store is present
      return {
        conversation: 'hello'
      }
    }
  })



  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect , qr } = update
    await qrcode.toDataURL(`${qr}`, { scale: 8 }).then(async (data) => {
    const result = await uploadImages(data, 'qr')
    console.log(result)
    })
    if (connection === 'close') {
      lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? main() : console.log('Koneksi Terputus...')
    }
    console.log('Koneksi Terhubung...')
  })

  const getGroupAdmins = (member) => {
    admins = []
    for (let i of member) {
      if (i.admin === "admin" || i.admin === "superadmin")
        admins.push(i.id)
    }
    return admins
  }

  conn.ev.on('messages.upsert', async chat => {
    try {
      m = chat.messages[0]
      if (!m.message) return
      console.log(m)
      if (m.key && m.key.remoteJid == 'status@broadcast') return;
      m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
      let type = Object.keys(m.message)
      const from = m.key.remoteJid
      const isGroup = from.endsWith('@g.us')
      const content = JSON.stringify(m.message)
      type = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || type[type.length - 1]
      const body = (type === 'conversation') ? m.message.conversation : (type == 'imageMessage') ? m.message.imageMessage.caption : (type == 'videoMessage') ? m.message.videoMessage.caption : (type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.title || m.text) : ''
      const budo = (type === 'conversation' && m.message.conversation.startsWith('.')) ? m.message.conversation : (type == 'imageMessage') ? m.message.imageMessage.caption : (type == 'videoMessage') ? m.message.videoMessage.caption : (type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.title || m.text) : ''
      const command = budo.slice(1).trim().split(/ +/).shift().toLowerCase()
      const args = body.trim().split(/ +/).slice(1)
      const q = args.join(' ')
      const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
      const groupMembers = isGroup ? await groupMetadata.participants : ''
      const groupName = isGroup ? groupMetadata.subject : ''
      const botNumber = conn.user.id ? conn.user.id.split(":")[0] + "@s.whatsapp.net" : conn.user.id
      const groupAdmins = isGroup ? await getGroupAdmins(groupMembers) : ''
      const participants = isGroup ? await groupMetadata.participants : ''
      const sender = isGroup ? m.key.participant : m.key.remoteJid
      const isGroupAdmins = isGroup ? groupAdmins.includes(sender) : false
      const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
      const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
      if (body == '.' || body == 'lazada' || body === 'tagall' || body == "dor") {
        if (isGroup) {
          teks = (args.length > 1) ? body.slice(8).trim() : ''
          teks += `  Total : ${groupMembers.length}\n`
          for (let mem of groupMembers) {
            teks += `╠➥ @${mem.id.split('@')[0]}\n`
          }
          conn.sendMessage(from, { text: '╔══✪〘 Mention All 〙✪══\n╠➥' + teks + `╚═〘 ${groupName} 〙`, mentions: participants.map(a => a.id) }, { quoted: m })
        }
      }

      if (body === "hidetag" || body === "`" || body === "Dear all" || body === "dear all" || body === "Dear All") {
        if (isGroup) {
          var options = {
            text: "",
            mentions: participants.map(a => a.id)
          }
          conn.sendMessage(from, options)
        }
      }

      if (body === "off") {
        conn.sendPresenceUpdate('unavailable')
        conn.sendMessage(from, { text: "Success Offline" })
      } else if (body === "on") {
        conn.sendPresenceUpdate('available')
        conn.sendMessage(from, { text: "Success Online" })
      }

      switch (command) {
        case 'tag':
          if (!isGroup) return reply('Harus Di Grup')
          var options = {
            text: q,
            mentions: participants.map(a => a.id)
          }
          conn.sendMessage(from, options)
          break
      }

    } catch (err) {
      console.log(err)
    }
  })

  store.bind(conn.ev)
  conn.ev.on('creds.update', saveCreds)


}


main()
