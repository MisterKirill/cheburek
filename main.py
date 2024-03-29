import re
import os
import io
import string
import discord
import asyncio
import random
from glob import glob
from discord import app_commands
from dotenv import load_dotenv
from PIL import Image, ImageFont, ImageDraw


intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)

words = []

def generate_message():
    message = ''

    for _ in range(random.randint(1, 6)):
        message += random.choice(words) + ' '

    return message.rstrip()

@tree.command(name='generate', description='Generate a message')
async def generate(interaction: discord.Interaction):
    await interaction.response.send_message(generate_message())

@tree.command(name='demotivator', description='Generate a demotivator')
async def generate(interaction: discord.Interaction):
    path = random.choice(glob('data/images/*.png'))
    image = Image.open(path)
    image = image.resize((430, 334))

    template = Image.open('images/demotivator.png')
    template.paste(image, (72, 42))

    draw = ImageDraw.Draw(template)

    font = ImageFont.truetype('fonts/Impact.ttf', 32)
    draw.text((template.width // 2, 450), generate_message(), (255, 255, 255), font=font, anchor='mm')

    with io.BytesIO() as image_binary:
        template.save(image_binary, 'PNG')
        image_binary.seek(0)
        await interaction.response.send_message(file=discord.File(image_binary, 'demotivator.png'))

@tree.command(name='fresco', description='Generate a Fresco meme')
async def generate(interaction: discord.Interaction):
    template = Image.open('images/fresco.png')

    draw = ImageDraw.Draw(template)

    font = ImageFont.truetype('fonts/Arial.ttf', 23)
    draw.text((165, 160), generate_message(), (0, 0, 0), font=font, anchor='mm')

    with io.BytesIO() as image_binary:
        template.save(image_binary, 'PNG')
        image_binary.seek(0)
        await interaction.response.send_message(file=discord.File(image_binary, 'demotivator.png'))

@tree.command(name='stats', description='Get statistics')
async def generate(interaction: discord.Interaction):
    images = glob('data/images/*.png')
    await interaction.response.send_message(f'> Words count: **{len(words)} words**\n> Images count: **{len(images)} images**')

@client.event
async def on_message(ctx: discord.Message):
    if ctx.author.bot:
        return
    
    content = re.sub(r' +', ' ', ctx.content)

    for word in content.split(' '):
        word = word.translate(str.maketrans('', '', string.punctuation)).strip().lower().replace('\n', '')
        
        if word == '':
            continue
        if word.find('http://') != -1 or word.find('https://') != -1:
            continue
        elif re.search(r'<@([0-9]*)>', word):
            continue
        elif word in words:
            continue
        else:
            with open('data/words.txt', 'a', encoding='utf8', buffering=1) as file:
                file.write(word + '\n')
            words.append(word)
            print(f'New word from {ctx.author}: {word}')
    
    for attachment in ctx.attachments:
        # I guess it should work
        if attachment.content_type.startswith('image/'):
            await attachment.save(f'data/images/{ctx.id}.png')
            print(f'New image from {ctx.author}')

@client.event
async def on_ready():
    with open('data/words.txt', 'r', encoding='utf8') as file:
        for line in file.readlines():
            words.append(line.rstrip())

    print(f'Loaded {len(words)} words!')

    await tree.sync()

if __name__ == '__main__':
    load_dotenv()
    client.run(os.getenv('TOKEN'))
