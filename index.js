const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const http = require('http')

http.createServer((req, res) => {
  res.write('Drippy Manager is alive! 🔥')
  res.end()
}).listen(3000)

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

const WELCOME_CHANNEL_ID = '1509474966758887577'
const LEVEL_CHANNEL_ID = '1509549726901735635'

const LEVEL_ROLES = {
  5:  '1509549932745588919',
  10: '1509549958968381460',
  20: '1509549978086015036',
  30: '1509549990672859276',
  50: '1509550001347494150'
}

const xpData = {}
const cooldowns = {}

function getLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp))
}

function getXpForLevel(level) {
  return Math.pow(level / 0.1, 2)
}

client.on('ready', () => {
  console.log(`Drippy Manager is online as ${client.user.tag}!`)
})

client.on('guildMemberAdd', async (member) => {
  const channel = client.channels.cache.get(WELCOME_CHANNEL_ID)
  if (!channel) return
  const embed = new EmbedBuilder()
    .setTitle('👋 Welcome to DrippyBlox!')
    .setDescription(`Hey ${member}, welcome to the drippiest server on Discord! 🔥\n\n📜 Read the rules in <#rules>\n🎭 Grab your roles in <#roles>\n🔗 Check out the YouTube → youtube.com/@yt_drippyblox\n\nWe're a Minecraft & Anime community, enjoy your stay! 😎`)
    .setColor(0x9B59B6)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: 'DrippyBlox Community 🔥' })
    .setTimestamp()
  await channel.send({ embeds: [embed] })
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return
  if (!message.guild) return

  const userId = message.author.id
  const now = Date.now()

  // 60 second cooldown
  if (cooldowns[userId] && now - cooldowns[userId] < 60000) return
  cooldowns[userId] = now

  if (!xpData[userId]) xpData[userId] = { xp: 0, level: 0 }

  const xpGain = Math.floor(Math.random() * 11) + 5
  xpData[userId].xp += xpGain

  const newLevel = getLevel(xpData[userId].xp)

  if (newLevel > xpData[userId].level) {
    xpData[userId].level = newLevel

    const channel = client.channels.cache.get(LEVEL_CHANNEL_ID)
    if (channel) {
      const embed = new EmbedBuilder()
        .setTitle('🎉 LEVEL UP!')
        .setDescription(`${message.author} just reached **Level ${newLevel}**! 🔥`)
        .setColor(0x9B59B6)
        .setThumbnail(message.author.displayAvatarURL())
        .setTimestamp()
      await channel.send({ embeds: [embed] })
    }

    // Give role if level matches
    if (LEVEL_ROLES[newLevel]) {
      const member = message.guild.members.cache.get(userId)
      if (member) {
        // Remove old level roles
        for (const roleId of Object.values(LEVEL_ROLES)) {
          await member.roles.remove(roleId).catch(() => {})
        }
        // Add new role
        await member.roles.add(LEVEL_ROLES[newLevel]).catch(() => {})
      }
    }
  }

  // Commands
  if (message.content === '!rank') {
    const data = xpData[userId] || { xp: 0, level: 0 }
    const embed = new EmbedBuilder()
      .setTitle(`📊 ${message.author.username}'s Rank`)
      .addFields(
        { name: 'Level', value: `${data.level}`, inline: true },
        { name: 'XP', value: `${data.xp}`, inline: true },
        { name: 'XP to next level', value: `${Math.floor(getXpForLevel(data.level + 1) - data.xp)}`, inline: true }
      )
      .setColor(0x9B59B6)
      .setThumbnail(message.author.displayAvatarURL())
    await message.channel.send({ embeds: [embed] })
  }

  if (message.content === '!leaderboard') {
    const sorted = Object.entries(xpData)
      .sort((a, b) => b[1].xp - a[1].xp)
      .slice(0, 10)

    let desc = ''
    for (let i = 0; i < sorted.length; i++) {
      const user = await client.users.fetch(sorted[i][0]).catch(() => null)
      const username = user ? user.username : 'Unknown'
      desc += `**${i + 1}.** ${username} — Level ${sorted[i][1].level} (${sorted[i][1].xp} XP)\n`
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 DrippyBlox Leaderboard')
      .setDescription(desc || 'No data yet!')
      .setColor(0x9B59B6)
    await message.channel.send({ embeds: [embed] })
  }
})

client.login(process.env.TOKEN)
