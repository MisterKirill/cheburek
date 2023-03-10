const { appendFileSync, readFileSync, existsSync } = require('fs')
const { Client, GatewayIntentBits, ActivityType, AttachmentBuilder } = require('discord.js')
const { generateFresco } = require('./memes')
const config = require('./config')

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

let words = []

function random(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function gen(length) {
    let result = ''

    for(let i = 0;i < length;i++) {
        let noSpace = random(0, 100) < config.noSpaceChance
        let uppercased = random(0, 100) < config.uppercaseChance

        let word = words[random(0, words.length - 1)]

        if(!noSpace) word += ' '
        
        if(uppercased) word = word.toUpperCase()
        else word = word.toLowerCase()

        result += word
    }

    return result
}

function filterWord(word) {
    if(word.trim() == '') return false
    if(word.includes('@')) return false
    if(word.includes('http://')) return false
    if(word.includes('https://')) return false
    if(words.includes(word)) return false
    if(word.length > 20) return false

    // commands
    if(word == '!g') return false
    if(word == '!f') return false

    return true
}

bot.on('messageCreate', async msg => {
    if(msg.author.bot) return
    if(!msg.content) return

    if(msg.content.startsWith('!g') || msg.mentions.has(bot.user.id)) {
        let reply = gen(random(1, 5))
        msg.reply(reply)
    }

    if(msg.content.startsWith('!f')) {
        let reply = gen(random(1, 4))

        let fresco = await generateFresco(reply)

        msg.reply({files: [new AttachmentBuilder(fresco, 'fresco.jpg')]})
    }

    msg.content.split(' ').forEach(word => {
        word = word.replace(/\s\s+/g, ' ')
        word = word.trim()

        if(!filterWord(word)) return
        
        appendFileSync('data/words.txt', word + '\n')
        words.push(word)

        console.log('New word: ' + word)
    })
})

bot.on('ready', () => {
    if(!existsSync('data/words.txt')) {
        appendFileSync('data/words.txt', '')
    }

    readFileSync('data/words.txt', 'utf-8')
    .split('\n')
    .forEach(word => {
        if(filterWord(word)) words.push(word.trim())
    })

    changeStatus()
    setInterval(changeStatus, 180000)

    console.log('Loaded ' + words.length + ' words')
})

function changeStatus() {
    let end = words.length == 1 ? ' слово' : words.length > 1 && words.length < 5 ? ' слова' : ' слов'

    bot.user.setActivity(words.length + end, {
        type: ActivityType.Listening
    })
}

bot.login(config.token)