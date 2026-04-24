require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const express = require('express');

// 1. Servidor web para Render
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('XINTOKIO ONLINE 24/7'));
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

// 3. GIFS ANIME VARIADOS ESTILO NEKOTINA - ACTUALIZADOS 2026
const gifs = {
  kiss: [
    'https://media.tenor.com/gUiu1zyIiQcAAAAC/anime-kiss.gif',
    'https://media.tenor.com/F02Ep3b2jJgAAAAC/kiss-anime.gif',
    'https://media.tenor.com/8Sa2mN7YELMAAAAC/anime-kiss-love.gif',
    'https://media.tenor.com/Yhx8urH0XGEAAAAC/kiss-anime.gif',
    'https://media.tenor.com/04B4QYdW1yQAAAAC/anime-kiss.gif'
  ],
  hug: [
    'https://media.tenor.com/C-8LCCSbJ0gAAAAC/anime-hug.gif',
    'https://media.tenor.com/9e1aE_xJKW0AAAAC/anime-hug.gif',
    'https://media.tenor.com/G_IvZkVc1EwAAAAC/hug-anime.gif',
    'https://media.tenor.com/2bJ8r1i_1H8AAAAC/hug-anime.gif',
    'https://media.tenor.com/b3QvtN8_fW4AAAAC/anime-hug.gif'
  ],
  pat: [
    'https://media.tenor.com/7lWq3qYkQ6EAAAAC/anime-head-pat.gif',
    'https://media.tenor.com/w4P9jF-GVjIAAAAC/anime-pat.gif',
    'https://media.tenor.com/E6fMkQRZBdYAAAAC/headpat-anime.gif',
    'https://media.tenor.com/TLJpoqR-2FoAAAAC/anime-pat.gif',
    'https://media.tenor.com/0N3r8K8yq6YAAAAC/anime-headpat.gif'
  ],
  slap: [
    'https://media.tenor.com/5PVLn4OFUYsAAAAC/anime-slap.gif',
    'https://media.tenor.com/Ws6DmWIL-qIAAAAC/slap-anime.gif',
    'https://media.tenor.com/rVXByHOHzPIAAAAC/anime-slap.gif',
    'https://media.tenor.com/VhHnV55rVn4AAAAC/anime-slap.gif',
    'https://media.tenor.com/1i2pWnR9o3cAAAAC/slap.gif'
  ],
  punch: [
    'https://media.tenor.com/fJa4aXZSWn8AAAAC/anime-punch.gif',
    'https://media.tenor.com/BoYBoopIkX4AAAAC/punch-anime.gif',
    'https://media.tenor.com/Xz2E9vJ0d0wAAAAC/anime-punch.gif',
    'https://media.tenor.com/UhcyGsGk3jAAAAAC/anime-punch.gif'
  ],
  cry: [
    'https://media.tenor.com/tNL9h2JPeXMAAAAC/anime-cry.gif',
    'https://media.tenor.com/0Tz3B7q3fK8AAAAC/anime-crying.gif',
    'https://media.tenor.com/8V0V6pVw2GQAAAAC/anime-cry.gif',
    'https://media.tenor.com/tQ3J6OCYfPAAAAAC/sad-anime.gif',
    'https://media.tenor.com/SI2YvWq_5cMAAAAC/anime-cry.gif'
  ],
  puchero: [
    'https://media.tenor.com/1Z9f3k6q3mIAAAAC/anime-pout.gif',
    'https://media.tenor.com/3r5Q3tQ3Q3QAAAAC/pout-anime.gif',
    'https://media.tenor.com/9n2R8k9x7tYAAAAC/anime-pout.gif',
    'https://media.tenor.com/8fH4j3Q2w5EAAAAC/pouting-anime.gif'
  ],
  bite: [
    'https://media.tenor.com/Yg2r0c8f8bQAAAAC/anime-bite.gif',
    'https://media.tenor.com/1aH3fJ3k3b8AAAAC/bite-anime.gif',
    'https://media.tenor.com/qW7r9k5m6n0AAAAC/anime-bite.gif',
    'https://media.tenor.com/4pL8d3s6f1vAAAAC/bite.gif'
  ],
  cuddle: [
    'https://media.tenor.com/2f6e2d5f7h8AAAAC/anime-cuddle.gif',
    'https://media.tenor.com/h8a3j2k5l9MAAAAC/cuddle-anime.gif',
    'https://media.tenor.com/5gH9j3k7l2pAAAAC/anime-cuddle.gif',
    'https://media.tenor.com/7dF2s8h4k9qAAAAC/cuddle.gif'
  ],
  blush: [
    'https://media.tenor.com/4g5h6j7k8l9AAAAC/anime-blush.gif',
    'https://media.tenor.com/1q2w3e4r5t6AAAAC/blushing-anime.gif',
    'https://media.tenor.com/6yU8i9o0p1aAAAAC/anime-blush.gif',
    'https://media.tenor.com/3sD4f5g6h7jAAAAC/blush.gif'
  ],
  dance: [
    'https://media.tenor.com/5t6y7u8i9o0AAAAC/anime-dance.gif',
    'https://media.tenor.com/1a2s3d4f5g6AAAAC/dancing-anime.gif',
    'https://media.tenor.com/9kL0z1x2c3vAAAAC/anime-dance.gif',
    'https://media.tenor.com/7bN8m9q1w2eAAAAC/dance.gif'
  ],
  happy: [
    'https://media.tenor.com/7h8j9k0l1z2AAAAC/anime-happy.gif',
    'https://media.tenor.com/3x4c5v6b7n8AAAAC/happy-anime.gif',
    'https://media.tenor.com/2qW3e4r5t6yAAAAC/anime-happy.gif',
    'https://media.tenor.com/8uI9o0p1a2sAAAAC/happy.gif'
  ],
  angry: [
    'https://media.tenor.com/9m0n1b2v3c4AAAAC/anime-angry.gif',
    'https://media.tenor.com/5z6x7c8v9b0AAAAC/angry-anime.gif',
    'https://media.tenor.com/1qA2s3d4f5gAAAAC/anime-angry.gif',
    'https://media.tenor.com/6hJ7k8l9z0xAAAAC/angry.gif'
  ],
  marry: [
    'https://media.tenor.com/1a2b3c4d5e6AAAAC/anime-wedding.gif',
    'https://media.tenor.com/7f8g9h0j1k2AAAAC/anime-marriage.gif',
    'https://media.tenor.com/3l4m5n6o7p8AAAAC/wedding-anime.gif',
    'https://media.tenor.com/9q0w1e2r3t4AAAAC/marriage.gif'
  ],
  propose: [
    'https://media.tenor.com/3l4m5n6o7p8AAAAC/anime-proposal.gif',
    'https://media.tenor.com/9q0w1e2r3t4AAAAC/propose-anime.gif',
    'https://media.tenor.com/5yU6i7o8p9aAAAAC/anime-propose.gif',
    'https://media.tenor.com/2sD3f4g5h6jAAAAC/proposal.gif'
  ]
};

function randomGif(type) {
  const arr = gifs[type] || gifs['hug'];
  return arr[Math.floor(Math.random() * arr.length)];
}

// Base de datos simple para matrimonios
const marriages = new Map();

// 4. Evento ready
client.once('ready', async () => {
  console.log(`✅ XINTOKIO online como ${client.user.tag}`);
  const commands = [
    // MODERACIÓN
    new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos'),
    new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unban').setDescription('Desbanea a un usuario').addStringOption(o => o.setName('userid').setDescription('ID del usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('kick').setDescription('Expulsa a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('mute').setDescription('Silencia a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('minutos').setDescription('Minutos 1-10080').setRequired(true).setMinValue(1).setMaxValue(10080)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unmute').setDescription('Quita el timeout').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Advierte a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Borra mensajes').addIntegerOption(o => o.setName('cantidad').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100)),
    new SlashCommandBuilder().setName('lock').setDescription('Bloquea el canal').addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unlock').setDescription('Desbloquea el canal'),
    new SlashCommandBuilder().setName('slowmode').setDescription('Activa modo lento').addIntegerOption(o => o.setName('segundos').setDescription('0-21600. 0 quita').setRequired(true).setMinValue(0).setMaxValue(21600)),
    new SlashCommandBuilder().setName('decir').setDescription('XINTOKIO envía un mensaje').addStringOption(o => o.setName('mensaje').setDescription('Mensaje').setRequired(true)),
    // ROL / INTERACCIÓN
    new SlashCommandBuilder().setName('kiss').setDescription('Besa a alguien').addUserOption(o => o.setName('usuario').setDescription('A quien besar').setRequired(true)),
    new SlashCommandBuilder().setName('hug').setDescription('Abraza a alguien').addUserOption(o => o.setName('usuario').setDescription('A quien abrazar').setRequired(true)),
    new SlashCommandBuilder().setName('pat').setDescription('Acaricia a alguien').addUserOption(o => o.setName('usuario').setDescription('A quien acariciar').setRequired(true)),
    new SlashCommandBuilder().setName('slap').setDescription('Cachetea a alguien').addUserOption(o => o.setName('usuario').setDescription('A quien cachetear').setRequired(true)),
    new SlashCommandBuilder().setName('punch').setDescription('Golpea a alguien').addUserOption(o => o.setName('usuario').setDescription('A quien golpear').setRequired(true)),
    new SlashCommandBuilder().setName('bite').setDescription('Muerde a alguien').addUserOption(o => o.setName('usuario').setDescription('A quien morder').setRequired(true)),
    new SlashCommandBuilder().setName('cuddle').setDescription('Acurrúcate con alguien').addUserOption(o => o.setName('usuario').setDescription('Con quien acurrucarte').setRequired(true)),
    new SlashCommandBuilder().setName('cry').setDescription('Llora'),
    new SlashCommandBuilder().setName('puchero').setDescription('Haz puchero'),
    new SlashCommandBuilder().setName('blush').setDescription('Sonrójate'),
    new SlashCommandBuilder().setName('dance').setDescription('Baila'),
    new SlashCommandBuilder().setName('happy').setDescription('Estar feliz'),
    new SlashCommandBuilder().setName('angry').setDescription('Enójate'),
    new SlashCommandBuilder().setName('propose').setDescription('Propón matrimonio').addUserOption(o => o.setName('usuario').setDescription('A quien proponerle').setRequired(true)),
    new SlashCommandBuilder().setName('marry').setDescription('Acepta una propuesta de matrimonio').addUserOption(o => o.setName('usuario').setDescription('Quien te propuso').setRequired(true)),
    new SlashCommandBuilder().setName('divorce').setDescription('Divórciate de tu pareja'),
    new SlashCommandBuilder().setName('marriage').setDescription('Ve con quién estás casado')
  ].map(command => command.toJSON());

  await client.application.commands.set(commands);
  console.log('✅ 28 comandos registrados: 12 mod + 16 rol');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    const rolCommands = ['kiss', 'hug', 'pat', 'slap', 'punch', 'bite', 'cuddle', 'cry', 'puchero', 'blush', 'dance', 'happy', 'angry', 'propose', 'marry', 'divorce', 'marriage'];
    if (!rolCommands.includes(commandName)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } else {
      await interaction.deferReply();
    }

    // HELP
    if (commandName === 'help') {
      const embed = new EmbedBuilder()
   .setTitle('🤖 Comandos de XINTOKIO')
   .setColor('#FF69B4')
   .addFields(
        { name: '🔨 Moderación', value: '`/ban` `/unban` `/kick` `/mute` `/unmute` `/warn` `/clear` `/lock` `/unlock` `/slowmode`', inline: false },
        { name: '💖 Interacción Tierna', value: '`/kiss` `/hug` `/pat` `/cuddle` `/blush` `/happy`', inline: false },
        { name: '😈 Interacción Travesura', value: '`/slap` `/punch` `/bite` `/angry`', inline: false },
        { name: '😭 Emociones', value: '`/cry` `/puchero` `/dance`', inline: false },
        { name: '💍 Matrimonio', value: '`/propose` `/marry` `/divorce` `/marriage`', inline: false },
        { name: '⚙️ Utilidad', value: '`/decir` `/help`', inline: false }
      )
   .setFooter({ text: 'XINTOKIO Bot | Estilo Nekotina Completo' });
      return interaction.editReply({ embeds: [embed] });
    }

    // MODERACIÓN
    if (commandName === 'ban') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'No especificada';
      await interaction.guild.members.ban(user, { reason: `Por ${interaction.user.tag}: ${reason}` });
      const embed = new EmbedBuilder().setColor('#FF0000').setTitle('🔨 Usuario Baneado').setDescription(`**${user.tag}** fue baneado.`).addFields({ name: 'Razón', value: reason }, { name: 'Moderador', value: `${interaction.user}` });
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'unban') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const userid = interaction.options.getString('userid');
      const reason = interaction.options.getString('razon') || 'No especificada';
      await interaction.guild.members.unban(userid, `Por ${interaction.user.tag}: ${reason}`);
      return interaction.editReply({ content: `✅ Usuario \`${userid}\` desbaneado. Razón: ${reason}` });
    }

    if (commandName === 'kick') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Expulsar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'No especificada';
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick(`Por ${interaction.user.tag}: ${reason}`);
      return interaction.editReply({ content: `👢 **${user.tag}** expulsado. Razón: ${reason}` });
    }

    if (commandName === 'mute') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const minutos = interaction.options.getInteger('minutos');
      const reason = interaction.options.getString('razon') || 'No especificada';
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(minutos * 60 * 1000, `Por ${interaction.user.tag}: ${reason}`);
      return interaction.editReply({ content: `🔇 **${user.tag}** muteado ${minutos} min. Razón: ${reason}` });
    }

    if (commandName === 'unmute') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(null);
      return interaction.editReply({ content: `🔊 **${user.tag}** desmuteado.` });
    }

    if (commandName === 'warn') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon');
      const embed = new EmbedBuilder().setColor('#FFFF00').setTitle('⚠️ Advertencia').setDescription(`${user} has sido advertido.`).addFields({ name: 'Razón', value: reason }, { name: 'Moderador', value: `${interaction.user}` });
      await interaction.channel.send({ content: `${user}`, embeds: [embed] });
      return interaction.editReply({ content: `✅ ${user.tag} advertido.` });
    }

    if (commandName === 'clear') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar mensajes`.' });
      const cantidad = interaction.options.getInteger('cantidad');
      const deleted = await interaction.channel.bulkDelete(cantidad, true);
      return interaction.editReply({ content: `🗑️ Borré ${deleted.size} mensajes.` });
    }

    if (commandName === 'lock') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar canales`.' });
      const reason = interaction.options.getString('razon') || 'No especificada';
      await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
      const embed = new EmbedBuilder().setColor('#FF0000').setTitle('🔒 Canal Bloqueado').setDescription(`Bloqueado por ${interaction.user}`).addFields({ name: 'Razón', value: reason });
      await interaction.channel.send({ embeds: [embed] });
      return interaction.editReply({ content: '✅ Canal bloqueado.' });
    }

    if (commandName === 'unlock') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar canales`.' });
      await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
      const embed = new EmbedBuilder().setColor('#00FF00').setTitle('🔓 Canal Desbloqueado').setDescription(`Desbloqueado por ${interaction.user}`);
      await interaction.channel.send({ embeds: [embed] });
      return interaction.editReply({ content: '✅ Canal desbloqueado.' });
    }

    if (commandName === 'slowmode') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar canales`.' });
      const segundos = interaction.options.getInteger('segundos');
      await interaction.channel.setRateLimitPerUser(segundos);
      return interaction.editReply({ content: segundos === 0? '✅ Modo lento desactivado.' : `✅ Modo lento: ${segundos}s.` });
    }

    if (commandName === 'decir') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar mensajes`.' });
      const mensaje = interaction.options.getString('mensaje');
      await interaction.channel.send(mensaje);
      return interaction.editReply({ content: '✅ Enviado.' });
    }

    // INTERACCIÓN BÁSICA
    const interactionCmds = {
      kiss: { text: 'le dio un beso a', color: '#FFB6C1', emoji: '😘' },
      hug: { text: 'abrazó a', color: '#FFD700', emoji: '🤗' },
      pat: { text: 'acarició a', color: '#87CEEB', emoji: '🥰' },
      slap: { text: 'cacheteó a', color: '#FF4500', emoji: '💢' },
      punch: { text: 'golpeó a', color: '#DC143C', emoji: '👊' },
      bite: { text: 'mordió a', color: '#FF6347', emoji: '😈' },
      cuddle: { text: 'se acurrucó con', color: '#FFA07A', emoji: '🤤' }
    };

    if (Object.keys(interactionCmds).includes(commandName)) {
      const user = interaction.options.getUser('usuario');
      if (user.id === interaction.user.id && ['kiss', 'slap', 'punch', 'bite'].includes(commandName)) {
        return interaction.editReply({ content: '❌ No puedes hacerte eso a ti mismo 🤨' });
      }
      const cmd = interactionCmds[commandName];
      const embed = new EmbedBuilder().setColor(cmd.color).setDescription(`${cmd.emoji} **${interaction.user.username}** ${cmd.text} **${user.username}**`).setImage(randomGif(commandName));
      return interaction.editReply({ embeds: [embed] });
    }

    // EMOCIONES SIN TARGET
    const emotionCmds = {
      cry: { text: 'está llorando...', color: '#4682B4', emoji: '😭' },
      puchero: { text: 'hizo puchero', color: '#DDA0DD', emoji: '😤' },
      blush: { text: 'se sonrojó', color: '#FFC0CB', emoji: '😳' },
      dance: { text: 'está bailando', color: '#98FB98', emoji: '💃' },
      happy: { text: 'está feliz', color: '#FFD700', emoji: '😄' },
      angry: { text: 'está enojado', color: '#FF0000', emoji: '😠' }
    };

    if (Object.keys(emotionCmds).includes(commandName)) {
      const cmd = emotionCmds[commandName];
      const embed = new EmbedBuilder().setColor(cmd.color).setDescription(`${cmd.emoji} **${interaction.user.username}** ${cmd.text}`).setImage(randomGif(commandName));
      return interaction.editReply({ embeds: [embed] });
    }

    // MATRIMONIO
    if (commandName === 'propose') {
      const user = interaction.options.getUser('usuario');
      if (user.id === interaction.user.id) return interaction.editReply({ content: '❌ No te puedes proponer matrimonio a ti mismo 😂' });
      if (marriages.has(interaction.user.id)) return interaction.editReply({ content: '❌ Ya estás casado. Usa `/divorce` primero.' });
      if (marriages.has(user.id)) return interaction.editReply({ content: '❌ Esa persona ya está casada 😢' });

      marriages.set(interaction.user.id, { pending: user.id });
      const embed = new EmbedBuilder().setColor('#FF69B4').setTitle('💍 Propuesta de Matrimonio').setDescription(`**${interaction.user.username}** le propuso matrimonio a **${user.username}**!`).setImage(randomGif('propose')).setFooter({ text: `${user.username} usa /marry @${interaction.user.username} para aceptar` });
      return interaction.editReply({ content: `${user}`, embeds: [embed] });
    }

    if (commandName === 'marry') {
      const user = interaction.options.getUser('usuario');
      const proposal = marriages.get(user.id);
      if (!proposal || proposal.pending!== interaction.user.id) return interaction.editReply({ content: '❌ Esa persona no te propuso matrimonio.' });
      if (marriages.has(interaction.user.id)) return interaction.editReply({ content: '❌ Ya estás casado. Usa `/divorce` primero.' });

      marriages.set(user.id, { married: interaction.user.id });
      marriages.set(interaction.user.id, { married: user.id });
      const embed = new EmbedBuilder().setColor('#FF1493').setTitle('💒 ¡Matrimonio!').setDescription(`**${user.username}** y **${interaction.user.username}** ahora están casados!`).setImage(randomGif('marry'));
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'divorce') {
      const marriage = marriages.get(interaction.user.id);
      if (!marriage ||!marriage.married) return interaction.editReply({ content: '❌ No estás casado.' });

      const partnerId = marriage.married;
      marriages.delete(interaction.user.id);
      marriages.delete(partnerId);
      return interaction.editReply({ content: `💔 Te divorciaste de <@${partnerId}>.` });
    }

    if (commandName === 'marriage') {
      const marriage = marriages.get(interaction.user.id);
      if (!marriage ||!marriage.married) return interaction.editReply({ content: '💔 No estás casado actualmente.' });
      return interaction.editReply({ content: `💍 Estás casado con <@${marriage.married}>` });
    }

  } catch (error) {
    console.error('Error:', error);
    const errorMsg = '❌ Error: Revisa mis permisos o que el usuario exista.';
    if (interaction.deferred || interaction.replied) {
      interaction.editReply({ content: errorMsg }).catch(() => {});
    } else {
      interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
});

process.on('unhandledRejection', error => console.error('Unhandled:', error));
client.login(process.env.TOKEN); 
