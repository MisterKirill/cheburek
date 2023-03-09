const { appendFileSync, readFileSync, existsSync } = require('fs')
const { Client, GatewayIntentBits, ActivityType } = require('discord.js')
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

        result += word
    }

    return result
}

function filterWord(word) {
    if(word.trim() == '') return false
    if(word.includes('@')) return false
    if(word.includes('http://')) return false
    if(word.includes('https://')) return false
    if(words.includes(word)) return
    if(word == '!gen') return
    return true
}

bot.on('messageCreate', msg => {
    if(msg.author.bot) return
    if(!msg.content) return

    if(msg.content.startsWith('!gen') || msg.mentions.has(bot.user.id)) {
        let reply = gen(random(1, 5))
        msg.reply(reply)
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