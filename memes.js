const { createCanvas, loadImage } = require('canvas')
const { writeFileSync } = require('fs')

async function generateFresco(text) {
    const canvas = createCanvas(561, 281)
    const ctx = canvas.getContext('2d')

    let bg = await loadImage('img/fresco.jpg')
    ctx.drawImage(bg, 0, 0, 561, 281)

    ctx.font = '20px "Serif"'
    ctx.textAlign = 'center'
    ctx.fillText(text, 165, 170)

    return canvas.toBuffer()
}

module.exports = {
    generateFresco
}