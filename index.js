const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const http = require('http')

http.createServer((req, res) => {
  res.write('Drippy Welcome is alive! 🔥')
  res.end()
}).listen(3000)

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
})

const WELCOME_CHANNEL_ID = '1509474966758887577'

client.on('ready', () => {
  console.log(`Drippy Welcome is online as ${client.user.tag}!`)
})

client.on('guildMemberAdd', async (member) => {
  const channel = client.channels.cache.get(WELCOME_CHANNEL_ID)
  if (!channel) return
  const embed = new EmbedBuilder()
    .setTitle('👋 Welcome to DrippyBlox!')
    .setDescription(`Hey ${member}, welcome to the drippiest server on Discord! 🔥\n\n📜 Read the rules in <#1509474966758887577>\n🎭 Grab your roles in <#roles>\n🔗 Check out the YouTube → youtube.com/@yt_drippyblox\n\nWe're a Minecraft & Anime community, enjoy your stay! 😎`)
    .setColor(0x9B59B6)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: 'DrippyBlox Community 🔥' })
    .setTimestamp()
  await channel.send({ embeds: [embed] })
})

client.login(process.env.TOKEN)
