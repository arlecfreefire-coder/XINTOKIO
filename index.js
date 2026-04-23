const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const http = require('http');

// Servidor web para que Render no llore con los puertos
http.createServer((req, res) => res.end('XINTOKIO ONLINE')).listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('clientReady', async () => {
  console.log(`XINTOKIO online como ${client.user.tag}`);
  const commands = [
    new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos'),
    new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario a banear').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón del ban')),
    new SlashCommandBuilder().setName('kick').setDescription('Expulsa a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario a expulsar').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón del kick')),
    new SlashCommandBuilder().setName('mute').setDescription('Silencia a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario a mutear').setRequired(true)).addIntegerOption(o => o.setName('minutos').setDescription('Minutos de mute').setRequired(true)),
    new SlashCommandBuilder().setName('unmute').setDescription('Quita el mute a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Borra mensajes').addIntegerOption(o => o.setName('cantidad').setDescription('Cantidad 1-100').setRequired(true)),
    new SlashCommandBuilder().setName('decir').setDescription('XINTOKIO envía un mensaje').addStringOption(o => o.setName('mensaje').setDescription('Mensaje').setRequired(true))
  ].map(command => command.toJSON());
  
  await client.application.commands.set(commands);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    if (commandName === 'help') {
      const embed = new EmbedBuilder().setTitle('🤖 Comandos de XINTOKIO').setColor('#FF69B4').addFields(
        { name: '/ban @usuario razón', value: 'Banea usuarios' },
        { name: '/kick @usuario razón', value: 'Expulsa usuarios' },
        { name: '/mute @usuario minutos', value: 'Silencia con timeout' },
        { name: '/unmute @usuario', value: 'Quita el timeout' },
        { name: '/clear cantidad', value: 'Borra mensajes 1-100' },
        { name: '/decir mensaje', value: 'El bot habla por ti' }
      );
      await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'ban') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: 'No tienes permisos para banear.', flags: 64 });
      }
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Sin razón';
      await interaction.guild.members.ban(user, { reason });
      await interaction.reply(`🔨 ${user.tag} fue baneado. Razón: ${reason}`);
    }

    if (commandName === 'kick') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.reply({ content: 'No tienes permisos para expulsar.', flags: 64 });
      }
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Sin razón';
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick(reason);
      await interaction.reply(`👢 ${user.tag} fue expulsado. Razón: ${reason}`);
    }

    if (commandName === 'mute') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({ content: 'No tienes permisos para mutear.', flags: 64 });
      }
      const user = interaction.options.getUser('usuario');
      const minutos = interaction.options.getInteger('minutos');
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(minutos * 60 * 1000, 'Mute por comando');
      await interaction.reply(`🔇 ${user.tag} muteado por ${minutos} minutos.`);
    }

    if (commandName === 'unmute') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({ content: 'No tienes permisos.', flags: 64 });
      }
      const user = interaction.options.getUser('usuario');
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(null);
      await interaction.reply(`🔊 ${user.tag} desmuteado.`);
    }

    if (commandName === 'clear') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: 'No tienes permisos.', flags: 64 });
      }
      const cantidad = interaction.options.getInteger('cantidad');
      if (cantidad < 1 || cantidad > 100 
