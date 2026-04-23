const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const express = require('express');

// 1. Servidor web PRIMERO para que Render no mate el proceso
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('XINTOKIO ONLINE'));
app.listen(port, () => console.log(`Servidor corriendo en puerto ${port}`));

// 2. Cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 3. Evento ready
client.once('ready', async () => {
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
  console.log('Comandos registrados');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (commandName === 'help') {
      const embed = new EmbedBuilder().setTitle('🤖 Comandos de XINTOKIO').setColor('#FF69B4').addFields(
        { name: '/ban @usuario razón', value: 'Banea usuarios' },
        { name: '/kick @usuario razón', value: 'Expulsa usuarios' },
        { name: '/mute @usuario minutos', value: 'Silencia con timeout' },
        { name: '/unmute @usuario', value: 'Quita el timeout' },
        { name: '/clear cantidad', value: 'Borra mensajes 1-100' },
        { name: '/decir mensaje', value: 'El bot habla por ti' }
      );
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'ban') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.editReply({ content: 'No tienes permisos para banear.' });
      }
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Sin razón';
      await interaction.guild.members.ban(user, { reason });
      await interaction.editReply({ content: `🔨 ${user.tag} fue baneado. Razón: ${reason}` });
    }

    if (commandName === 'kick') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.editReply({ content: 'No tienes permisos para expulsar.' });
      }
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Sin razón';
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick(reason);
      await interaction.editReply({ content: `👢 ${user.tag} fue expulsado. Razón: ${reason}` });
    }

    if (commandName === 'mute') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.editReply({ content: 'No tienes permisos para mutear.' });
      }
      const user = interaction.options.getUser('usuario');
      const minutos = interaction.options.getInteger('minutos');
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(minutos * 60 * 1000, 'Mute por comando');
      await interaction.editReply({ content: `🔇 ${user.tag} muteado por ${minutos} minutos.` });
    }

    if (commandName === 'unmute') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.editReply({ content: 'No tienes permisos.' });
      }
      const user = interaction.options.getUser('usuario');
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(null);
      await interaction.editReply({ content: `🔊 ${user.tag} desmuteado.` });
    }

    if (commandName === 'clear') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.editReply({ content: 'No tienes permisos.' });
      }
      const cantidad = interaction.options.getInteger('cantidad');
      if (cantidad < 1 || cantidad > 100) {
        return interaction.editReply({ content: 'Pon un número entre 1 y 100.' });
      }
      const deleted = await interaction.channel.bulkDelete(cantidad, true);
      await interaction.editReply({ content: `🗑️ Borré ${deleted.size} mensajes.` });
    }

    if (commandName === 'decir') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.editReply({ content: 'No tienes permisos para usar este comando.' });
      }
      const mensaje = interaction.options.getString('mensaje');
      await interaction.channel.send(mensaje);
      await interaction.editReply({ content: '✅ Enviado.' });
    }

  } catch (error) {
    console.error(error);
    const errorMsg = '❌ Algo salió mal. Revisa mis permisos o que el usuario exista.';

    if (interaction.deferred || interaction.replied) {
      interaction.editReply({ content: errorMsg }).catch(() => {});
    } else {
      interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
});

client.login(process.env.TOKEN);
