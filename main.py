import re
import os
import string
import discord
import asyncio
import random
from discord import app_commands
from dotenv import load_dotenv


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

@client.event
async def on_message(ctx: discord.Message):
    if ctx.author.bot:
        return
    
    content = re.sub(r' +', ' ', ctx.content)

    for word in content.split(' '):
        if word.find('http://') != -1 or word.find('https://') != -1:
            continue
        elif re.search(r'<@([0-9]*)>', word):
            continue
        elif word in words:
            continue
        else:
            word = word.translate(str.maketrans('', '', string.punctuation)).lower()

            with open('data/words.txt', 'a', encoding='utf8', buffering=1) as file:
                file.write(word + '\n')

            words.append(word)

@tree.command(name='generate', description='Generate a message')
async def generate(interaction: discord.Interaction):
    await interaction.response.send_message(generate_message())

async def status_task():
    while True:
        if len(words) == 1:
            await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name=f'{len(words)} word'))
        else:
            await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name=f'{len(words)} words'))
        await asyncio.sleep(10)

@client.event
async def on_ready():
    await tree.sync()
    client.loop.create_task(status_task())

    with open('data/words.txt', 'r', encoding='utf8') as file:
        for line in file.readlines():
            words.append(line.rstrip())

    print(f'Loaded {len(words)} words!')

if __name__ == '__main__':
    load_dotenv()
    client.run(os.getenv('TOKEN'))
