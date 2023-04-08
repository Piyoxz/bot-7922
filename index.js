const { default: makeWASocket, DisconnectReason, downloadContentFromMessage, useMultiFileAuthState, makeInMemoryStore } = require('@adiwajshing/baileys')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const fs = require('fs-extra')
const axios = require('axios')
const qre = require('qr-image')
const { Sticker } = require('wa-sticker-formatter')

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })


store.readFromFile('./baileys_store1.json')
// saves the state to a file every 10s
setInterval(() => {
  store.writeToFile('./baileys_store1.json')
}, 10_000)


const get = (from, _dir) => {
    let position = null
    Object.keys(_dir).forEach((i) => {
      if (_dir[i].id === from) {
        position = i
      }
    })
    if (position !== null) {
      return position
    }
  }


  const checkgroup = (userId, _dir) => {
    let status = false
    Object.keys(_dir).forEach((i) => {
      if (_dir[i].id === userId) {
        status = true
      }
    })
    return status
  }


  async function newsticker(img) {
    const stickerMetadata = {
      type: 'full', //can be full or crop
      pack: 'punya',
      author: 'piyo',
      categories: 'deswita',
    }
    return await new Sticker(img, stickerMetadata).build()
  }

  const checkteks = (userId, _dir) => {
    let position = null
    Object.keys(_dir).forEach((i) => {
      if (_dir[i].id === userId) {
        position = i
      }
    })
    if (position !== null) {
      return _dir[position].text
    }
  }





require("@igorkowalczyk/repl-uptime").config({
 port: 8080,
 path: "/",
 message: "Don't let your repl go to sleep!",
 debug: true,
}); 

async function main() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")
  const conn = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  })



  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
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
      if (!m.key.fromMe) return
      m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
      let type = Object.keys(m.message)
      const from = m.key.remoteJid
      const isGroup = from.endsWith('@g.us')
      const content = JSON.stringify(m.message)
      type = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || type[type.length - 1]
      const body = (type === 'conversation') ? m.message.conversation : (type == 'imageMessage') ? m.message.imageMessage.caption : (type == 'videoMessage') ? m.message.videoMessage.caption : (type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.title || m.text) : ''
       const bude = (type === 'conversation' && m.message.conversation.startsWith('.')) ? m.message.conversation : ''
      const budo = (type === 'conversation' && m.message.conversation.startsWith('.')) ? m.message.conversation : (type == 'imageMessage') ? m.message.imageMessage.caption : (type == 'videoMessage') ? m.message.videoMessage.caption : (type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.title || m.text) : ''
      const command = budo.slice(1).trim().split(/ +/).shift().toLowerCase()
      const args = body.trim().split(/ +/).slice(1)
       const argss = bude.trim().split(/ +/).slice(1)
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

        const reply = (text) => {
        conn.sendMessage(from, {
          text: text
        })
      }
      if (body == '.' || body == 'lazada' || body === 'tagall' || body == "dor") {
        if (isGroup && isGroupAdmins) {
          teks = (args.length > 1) ? body.slice(8).trim() : ''
          teks += `  Total : ${groupMembers.length}\n`
          for (let mem of groupMembers) {
            teks += `╠➥ @${mem.id.split('@')[0]}\n`
          }
          conn.sendMessage(from, { text: '╔══✪〘 Mention All 〙✪══\n╠➥' + teks + `╚═〘 ${groupName} 〙`, mentions: participants.map(a => a.id) }, { quoted: m })
        }
      }

      if (type === "conversation" || type === "extendedTextMessage") {
        if (body.match(new RegExp(/(https:\/\/chat.whatsapp.com)/gi))) {
          if (isOwner) {
            try {
              join = body.split('https://chat.whatsapp.com/')[1]
              await conn.groupAcceptInvite(join).then(async (data) => {
                await conn.sendMessage(from, { text: 'Succes Join To Grup' })
              })
            } catch (err) {
              console.log(err)
            }
          } else {
            let t = m
            const pe = JSON.parse(fs.readFileSync('anti.json'))
            if (!pe.includes(from)) return
            if (isGroupAdmins) return
            await conn.sendMessage(from, { text: "*Anti Link*\n\nDilarang Mengirimkan Link Grup Lain" }, { quoted: t })
            await conn.sendMessage(from, { delete: t.key })
            await conn.groupParticipantsUpdate(from, [sender], "remove")
          }
        }
      }

      if (body === "hidetag") {
        if (isGroup && isGroupAdmins) {
          var options = {
            text: "",
            mentions: participants.map(a => a.id)
          }
          conn.sendMessage(from, options, { quoted: m })
        }
      }

       if (body === ".anti") {
          if (!isGroupAdmins) return
          const per = m
          const pe = JSON.parse(fs.readFileSync('anti.json'))
          if (pe.includes(from)) {
            let tep = pe.indexOf(from)
            pe.splice(tep, 1)
            fs.writeFileSync('anti.json', JSON.stringify(pe))
            return conn.sendMessage(from, { text: "Sukses Matikan Shield Groupp" }, { quoted: per })
          }
          pe.push(from)
          fs.writeFileSync('anti.json', JSON.stringify(pe))
          conn.sendMessage(from, { text: "Sukses Aktifkan Shield Group" }, { quoted: per })
        }

      if (isGroupAdmins) {
          const cmd = bude.slice(1).trim().split(/ +/).shift().toLowerCase()
          const wel = JSON.parse(fs.readFileSync('welcome.json'))
          const q = argss.join(' ')
          if (cmd === "welcome") {
            if (checkgroup(from, wel) === true) {
              let posi = wel[get(from, wel)]
              posi.text = q
              fs.writeFileSync('welcome.json', JSON.stringify(wel, null, '\t'))
              conn.sendMessage(from, { text: 'sukses' })
            } else {
              obj = { id: from, text: q }
              wel.push(obj)
              fs.writeFileSync('welcome.json', JSON.stringify(wel, null, '\t'))
              conn.sendMessage(from, { text: 'sukses' })
            }
          }
        }

      switch (command) {
        case 'tag':
          if (!isGroup) return reply('Harus Di Grup')
          if (!isGroupAdmins) return
          var options = {
            text: q,
            mentions: participants.map(a => a.id)
          }
          conn.sendMessage(from, options)
          break
          case 'getsticker':
            if (!q) return reply("caranya adalah ketik .getsticker cariapa berapa");
            se = q
            se = se.split(' ')
            if (se[1] == null || se[1] == "" || se[1] == undefined) return reply("caranya adalah ketik .getsticker cariapa berapa");
            if (se[1] > 10) return reply("terlalu banyak hehehe");
            try {
              const gt = await axios.get('https://api.lolhuman.xyz/api/stickerwa?apikey=6db7e0c767bd9e84d1785be8&query=' + se[0])
              gte = gt.data.result[0].stickers
              for (let i = 0; i < se[1]; i++) {
                 const result = await newsticker(gte[i])
                conn.sendMessage(from, { sticker: result})
              }
              conn.sendMessage(from, { text: 'selesai' })
            } catch (err) {
              conn.sendMessage(from, { text: 'Error' })
            }
            break
           case 'menu':
            menu = `╔══✪ 〘 *MENU ZIAN* 〙✪══
╠➥  .sticker
╠➥  .getsticker textnya berapa
╠➥  .twitter linknya
╠➥  .welcome textnya 
╠➥  .tag textnya
╠➥  .open
╠➥  .close
╠➥  .anti
╠➥  tagall
╠➥  hidetag\n`
            if (isGroup) {
              if (q) {
                if (!isGroupAdmins) return
                menu += "╠➥  " + q
                conn.sendMessage(from, { text: menu + `\n╚═〘 ${groupName} 〙` })
              } else {
                conn.sendMessage(from, { text: menu + `╚═〘 ${groupName} 〙` })
              }
            } else {
              conn.sendMessage(from, { text: menu + `╚═〘 Piyobot 〙` })
            }
            break;
          case 'twitter':
            if (!q) return reply("ketik /tiwtter linknya")
            try {
              const twt = await axios.get('https://api.lolhuman.xyz/api/twitter2?apikey=6db7e0c767bd9e84d1785be8&url=' + q)
              const tw = twt.data.result
              const func = async (url) => {
                const response = await axios(url, { responseType: 'arraybuffer' })
                const buffer64 = Buffer.from(response.data, 'binary').toString('base64')
                return buffer64
              }
              conn.sendMessage(from, { video: { url: tw.link[0].url }, jpegThumbnail: func(tw.thumbnail) })
            } catch (err) {
              conn.sendMessage(from, { text: 'Error Downloads' + err });
            }
            break
            case 'kick':
            if (isGroup && isGroupAdmins) {
              if (!isBotGroupAdmins) return reply("Bot Bukan Admin")
              if (m.message.extendedTextMessage === undefined || m.message.extendedTextMessage === null) return reply("caranya ketik /kick @mention")
              mentioned = m.message.extendedTextMessage.contextInfo.mentionedJid
              const response = await conn.groupParticipantsUpdate(
                from,
                mentioned,
                "remove"
              )
              conn.sendMessage(from, { text: "Sukses Kick" })
            } else {
              conn.sendMessage(from, { text: "Kamu Bukan Admin" });
            }
            break
          case 'open':
            if (isGroup && isGroupAdmins) {
              if (!isBotGroupAdmins) return reply("Bot Bukan Admin")
              await conn.groupSettingUpdate(from, 'not_announcement')
              conn.sendMessage(from, { text: "Sukses Open Group", mentions: participants.map(a => a.id) })
            } else {
              conn.sendMessage(from, { text: "Kamu Bukan Admin" });
            }
            break
          case 'close':
            if (isGroup && isGroupAdmins) {
              if (!isBotGroupAdmins) return reply("Bot Bukan Admin")
              await conn.groupSettingUpdate(from, 'announcement')
              conn.sendMessage(from, { text: "Sukses Close Group", mentions: participants.map(a => a.id) })
            } else {
              conn.sendMessage(from, { text: "Kamu Bukan Admin" });
            }
            break
          case 's':
          case 'sticker':
            if (type === 'videoMessage' || isQuotedVideo) return reply('Image Only')
            const testt = isQuotedImage ? JSON.parse(JSON.stringify(m).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo.message.imageMessage : m.message.imageMessage
            const stream = await downloadContentFromMessage(testt, 'image')
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk])
            }
            const getRandom = (ext) => {
              return `${Math.floor(Math.random() * 10000)}${ext}`
            }
            ran = getRandom('.jpeg')
            await fs.writeFileSync(`./media/image/${ran}`, buffer)
            const result = await newsticker(`./media/image/${ran}`)
            await conn.sendMessage(from, { sticker: result }, { quoted: m })
            fs.unlinkSync(`./media/image/${ran}`)
            break
      }

    } catch (err) {
      console.log(err)
    }
  })

   conn.ev.on('group-participants.update', async mem => {
    let pek = mem.participants.toString()
    if (!pek.startsWith('62' || '60')) {
      await conn.sendMessage(mem.id, { text: "Orang Luar Terdeteksi\n\nOtomatis Kick" })
      return await conn.groupParticipantsUpdate(mem.id, [mem.participants], "remove")
    }
    parseMention = (text = '') => {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }
    const gp = JSON.parse(fs.readFileSync('welcome.json'))
    isGroup = mem.id.endsWith('@g.us')
    if (checkgroup(mem.id, gp) === true) {
      if (mem.action == 'add') {
        const teks2 = await checkteks(mem.id, gp)
        await conn.sendMessage(mem.id, { text: teks2 })
      }
    }
    const groupMetadata = isGroup ? await conn.groupMetadata(mem.id) : ''
    const groupMembers = isGroup ? await groupMetadata.participants : ''
    const groupAdmins = isGroup ? await getGroupAdmins(groupMembers) : ''

    if (mem.id === "120363040291467791@g.us") {
      if (mem.action == 'add') {
        teks4 = `welcome to My Time

Pertanyaan seputar orderan bisa menghubungi  @6285855259901 atau @6289521855655

Enjoy your time with mytime 🤍`
        await conn.sendMessage("120363040291467791@g.us", { text: teks4, mentions: groupAdmins.map(a => a) })
      }
    }
    if (mem.id === "6281270278196-1630299263@g.us") {
      if (mem.action == 'add') {
        const teks3 = `*HALO YANG BARU MASUK DI GRUP ARMY BANGTAN FAMILY*
   *semoga betahh yahh*
❗  *DI BAF wajib save no ADMIN disini ada 4 ADMIN*
❗  *pc LEADER stan kamu*
❗  *Dilarang spam yang tidak jelas*
❗  *Wajib nimbrung, jika ada halangan silahkan hubungi admin*
❗   *Absen setiap hari link ada di info grup*`
        await conn.sendMessage(mem.id, { text: teks3, mentions: groupAdmins.map(a => a) })
      }
    } else if (mem.id === "120363025082227077@g.us") {
      if (mem.action == 'add') {
        const getBuffer = async (url, options) => {
          try {
            options ? options : {}
            const res = await axios({
              method: "get",
              url,
              headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
              },
              ...options,
              responseType: 'arraybuffer'
            })
            return res.data
          } catch (e) {
            console.log(`Error : ${e}`)
          }
        }
        size = groupMetadata.size
        size = parseInt(size)
        const pp = await getBuffer('https://piyo-api.piyoxz.repl.co/welcome?size=' + size)
        const caption = `Selamat Datang @${mem.participants[0].split('@')[0]}`
        await conn.sendMessage(mem.id, { image: pp, caption: caption, mentions: [mem.participants[0]] })
      }
    }
  })
  store.bind(conn.ev)
  conn.ev.on('creds.update', saveCreds)


}


main()
