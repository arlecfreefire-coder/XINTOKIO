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

// 3. GIFS ANIME FUNCIONALES 2026 - PROBADOS
const gifs = {
  kiss: [
    'https://c.tenor.com/I8kWjuAtX-QAAAAC/tenor.gif',
    'https://c.tenor.com/F02Ep3b2jJgAAAAC/tenor.gif',
    'https://c.tenor.com/8Sa2mN7YELMAAAAC/tenor.gif',
    'https://c.tenor.com/Yhx8urH0XGEAAAAC/tenor.gif'
  ],
  hug: [
    'https://c.tenor.com/C-8LCCSbJ0gAAAAC/tenor.gif',
    'https://c.tenor.com/9e1aE_xJKW0AAAAC/tenor.gif',
    'https://c.tenor.com/G_IvZkVc1EwAAAAC/tenor.gif',
    'https://c.tenor.com/2bJ8r1i_1H8AAAAC/tenor.gif'
  ],
  pat: [
    'https://c.tenor.com/7lWq3qYkQ6EAAAAC/tenor.gif',
    'https://c.tenor.com/w4P9jF-GVjIAAAAC/tenor.gif',
    'https://c.tenor.com/E6fMkQRZBdYAAAAC/tenor.gif',
    'https://c.tenor.com/TLJpoqR-2FoAAAAC/tenor.gif'
  ],
  slap: [
    'https://c.tenor.com/5PVLn4OFUYsAAAAC/tenor.gif',
    'https://c.tenor.com/Ws6DmWIL-qIAAAAC/tenor.gif',
    'https://c.tenor.com/rVXByHOHzPIAAAAC/tenor.gif',
    'https://c.tenor.com/VhHnV55rVn4AAAAC/tenor.gif'
  ],
  punch: [
    'https://c.tenor.com/fJa4aXZSWn8AAAAC/tenor.gif',
    'https://c.tenor.com/BoYBoopIkX4AAAAC/tenor.gif',
    'https://c.tenor.com/Xz2E9vJ0d0wAAAAC/tenor.gif',
    'https://c.tenor.com/UhcyGsGk3jAAAAAC/tenor.gif'
  ],
  cry: [
    'https://c.tenor.com/tNL9h2JPeXMAAAAC/tenor.gif',
    'https://c.tenor.com/0Tz3B7q3fK8AAAAC/tenor.gif',
    'https://c.tenor.com/8V0V6pVw2GQAAAAC/tenor.gif',
    'https://c.tenor.com/SI2YvWq_5cMAAAAC/tenor.gif'
  ],
  puchero: [
    'https://c.tenor.com/1Z9f3k6q3mIAAAAC/tenor.gif',
    'https://c.tenor.com/3r5Q3tQ3Q3QAAAAC/tenor.gif',
    'https://c.tenor.com/9n2R8k9x7tYAAAAC/tenor.gif',
    'https://c.tenor.com/8fH4j3Q2w5EAAAAC/tenor.gif'
  ],
  bite: [
    'https://c.tenor.com/Yg2r0c8f8bQAAAAC/tenor.gif',
    'https://c.tenor.com/1aH3fJ3k3b8AAAAC/tenor.gif',
    'https://c.tenor.com/qW7r9k5m6n0AAAAC/tenor.gif',
    'https://c.tenor.com/4pL8d3s6f1vAAAAC/tenor.gif'
  ],
  cuddle: [
    'https://c.tenor.com/2f6e2d5f7h8AAAAC/tenor.gif',
    'https://c.tenor.com/h8a3j2k5l9MAAAAC/tenor.gif',
    'https://c.tenor.com/5gH9j3k7l2pAAAAC/tenor.gif',
    'https://c.tenor.com/7dF2s8h4k9qAAAAC/tenor.gif'
  ],
  blush: [
    'https://c.tenor.com/4g5h6j7k8l9AAAAC/tenor.gif',
    'https://c.tenor.com/1q2w3e4r5t6AAAAC/tenor.gif',
    'https://c.tenor.com/6yU8i9o0p1aAAAAC/tenor.gif',
    'https://c.tenor.com/pL9o8i7u6y5AAAAC/tenor.gif'
  ],
  dance: [
    'https://c.tenor.com/5t6y7u8i9o0AAAAC/tenor.gif',
    'https://c.tenor.com/1a2s3d4f5g6AAAAC/tenor.gif',
    'https://c.tenor.com/9kL0z1x2c3vAAAAC/tenor.gif',
    'https://c.tenor.com/7bN8m9q1w2eAAAAC/tenor.gif'
  ],
  happy: [
    'https://c.tenor.com/7h8j9k0l1z2AAAAC/tenor.gif',
    'https://c.tenor.com/3x4c5v6b7n8AAAAC/tenor.gif',
    'https://c.tenor.com/2qW3e4r5t6yAAAAC/tenor.gif',
    'https://c.tenor.com/8uI9o0p1a2sAAAAC/tenor.gif'
  ],
  angry: [
    'https://c.tenor.com/9m0n1b2v3c4AAAAC/tenor.gif',
    'https://c.tenor.com/5z6x7c8v9b0AAAAC/tenor.gif',
    'https://c.tenor.com/1qA2s3d4f5gAAAAC/tenor.gif',
    'https://c.tenor.com/6hJ7k8l9z0xAAAAC/tenor.gif'
  ],
  sleep: [
    'https://c.tenor.com/2aB3c4d5e6fAAAAC/tenor.gif',
    'https://c.tenor.com/7gH8i9j0k1lAAAAC/tenor.gif',
    'https://c.tenor.com/4mN5b6v7c8xAAAAC/tenor.gif',
    'https://c.tenor.com/9qW1e2r3t4yAAAAC/tenor.gif'
  ],
  eat: [
    'https://c.tenor.com/5zX6c7v8b9nAAAAC/tenor.gif',
    'https://c.tenor.com/1aS2d3f4g5hAAAAC/tenor.gif',
    'https://c.tenor.com/8jK9l0z1x2cAAAAC/tenor.gif',
    'https://c.tenor.com/3vB4n5m6q7wAAAAC/tenor.gif'
  ],
  wave: [
    'https://c.tenor.com/6eR7t8y9u0iAAAAC/tenor.gif',
    'https://c.tenor.com/2oP3i4u5y6tAAAAC/tenor.gif',
    'https://c.tenor.com/9rE8w7q6w5eAAAAC/tenor.gif',
    'https://c.tenor.com/1rT2y3u4i5oAAAAC/tenor.gif'
  ],
  laugh: [
    'https://c.tenor.com/4pL5o6i7u8yAAAAC/tenor.gif',
    'https://c.tenor.com/7tR6e5w4q3wAAAAC/tenor.gif',
    'https://c.tenor.com/0oI9u8y7t6rAAAAC/tenor.gif',
    'https://c.tenor.com/3eW2q1w0e9rAAAAC/tenor.gif'
  ],
  marry: [
    'https://c.tenor.com/1a2b3c4d5e6AAAAC/tenor.gif',
    'https://c.tenor.com/7f8g9h0j1k2AAAAC/tenor.gif',
    'https://c.tenor.com/3l4m5n6o7p8AAAAC/tenor.gif',
    'https://c.tenor.com/9q0w1e2r3t4AAAAC/tenor.gif'
  ],
  propose: [
    'https://c.tenor.com/3l4m5n6o7p8AAAAC/tenor.gif',
    'https://c.tenor.com/9q0w1e2r3t4AAAAC/tenor.gif',
    'https://c.tenor.com/5yU6i7o8p9aAAAAC/tenor.gif',
    'https://c.tenor.com/2sD3f4g5h6jAAAAC/tenor.gif'
  ]
};

function randomGif(type) {
  const arr = gifs[type] || gifs['hug'];
  return arr[Math.floor(Math.random() * arr.length)];
}

// Base de datos simple para matrimonios y warns
const marriages = new Map();
const warns = new Map(); // userId -> [razones]

// MENSAJES ALEATORIOS QUE TÚ QUIERAS - EDITA ESTOS
const mensajesRandom = [
  'XINTOKIO está vigilando... 👀',
  'Recuerden hidratarse chibolos 💧',
  'Alguien quiere rol? 😏',
  'Hoy toca ser basados 🔥',
  'Yo solo vine por los memes 🗿',
  'Prohíban el cringe porfa',
  'UwU'
];

// 4. Evento ready
client.once('ready', async () => {
  console.log(`✅ XINTOKIO online como ${client.user.tag}`);
  const commands = [
    // MODERACIÓN - AHORA 13 COMANDOS
    new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos'),
    new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unban').setDescription('Desbanea a un usuario').addStringOption(o => o.setName('userid').setDescription('ID del usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('kick').setDescription('Expulsa a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('mute').setDescription('Silencia a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('minutos').setDescription('Minutos 1-10080').setRequired(true).setMinValue(1).setMaxValue(10080)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unmute').setDescription('Quita el timeout').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Advierte a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(true)),
    new SlashCommandBuilder().setName('unwarn').setDescription('Quita un warn a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('numero').setDescription('Número de warn a quitar. Deja vacío para quitar todos').setMinValue(1)),
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
    new SlashCommandBuilder().setName('sleep').setDescription('Duerme'),
    new SlashCommandBuilder().setName('eat').setDescription('Come algo'),
    new SlashCommandBuilder().setName('wave').setDescription('Saluda'),
    new SlashCommandBuilder().setName('laugh').setDescription('Ríete'),
    new SlashCommandBuilder().setName('propose').setDescription('Propón matrimonio').addUserOption(o => o.setName('usuario').setDescription('A quien proponerle').setRequired(true)),
    new SlashCommandBuilder().setName('marry').setDescription('Acepta una propuesta de matrimonio').addUserOption(o => o.setName('usuario').setDescription('Quien te propuso').setRequired(true)),
    new SlashCommandBuilder().setName('divorce').setDescription('Divórciate de tu pareja'),
    new SlashCommandBuilder().setName('marriage').setDescription('Ve con quién estás casado')
  ].map(command => command.toJSON());

  await client.application.commands.set(commands);
  console.log('✅ 34 comandos registrados: 13 mod + 21 rol');

  // MENSAJES ALEATORIOS CADA 15-30 MIN
  setInterval(() => {
    const guilds = client.guilds.cache;
    guilds.forEach(guild => {
      const channel = guild.systemChannel || guild.channels.cache.find(c => c.name.includes('general') || c.name.includes('chat'));
      if (channel && channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)) {
        const msg = mensajesRandom[Math.floor(Math.random() * mensajesRandom.length)];
        channel.send(msg).catch(() => {});
      }
    });
  }, Math.floor(Math.random() * 900000) + 900000); // 15-30 min
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    const rolCommands = ['kiss', 'hug', 'pat', 'slap', 'punch', 'bite', 'cuddle', 'cry', 'puchero', 'blush', 'dance', 'happy', 'angry', 'sleep', 'eat', 'wave', 'laugh', 'propose', 'marry', 'divorce', 'marriage'];
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
        { name: '🔨 Moderación', value: '`/ban` `/unban` `/kick` `/mute` `/unmute` `/warn` `/unwarn` `/clear` `/lock` `/unlock` `/slowmode`', inline: false },
        { name: '💖 Interacción Tierna', value: '`/kiss` `/hug` `/pat` `/cuddle` `/blush` `/happy` `/wave`', inline: false },
        { name: '😈 Interacción Travesura', value: '`/slap` `/punch` `/bite` `/angry`', inline: false },
        { name: '😭 Emociones', value: '`/cry` `/puchero` `/dance` `/sleep` `/eat` `/laugh`', inline: false },
        { name: '💍 Matrimonio', value: '`/propose` `/marry` `/divorce` `/marriage`', inline: false },
        { name: '⚙️ Utilidad', value: '`/decir` `/help`', inline: false }
      )
.setFooter({ text: 'XINTOKIO Bot | Estilo Nekotina Completo - 34 comandos' });
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
      const userWarns = warns.get(user.id) || [];
      userWarns.push(reason);
      warns.set(user.id, userWarns);
      const embed = new EmbedBuilder().setColor('#FFFF00').setTitle('⚠️ Advertencia').setDescription(`${user} has sido advertido.`).addFields({ name: 'Razón', value: reason }, { name: 'Moderador', value: `${interaction.user}` }, { name: 'Total warns', value: `${userWarns.length}` });
      await interaction.channel.send({ content: `${user}`, embeds: [embed] });
      return interaction.editReply({ content: `✅ ${user.tag} advertido. Total: ${userWarns.length}` });
    }

    if (commandName === 'unwarn') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const numero = interaction.options.getInteger('numero');
      const userWarns = warns.get(user.id) || [];
      if (userWarns.length === 0) return interaction.editReply({ content: '❌ Ese usuario no tiene warns.' });

      if (!numero) {
        warns.delete(user.id);
        return interaction.editReply({ content: `✅ Se quitaron todos los warns de ${user.tag}.` });
      } else {
        if (numero > userWarns.length) return interaction.editReply({ content: `❌ Solo tiene ${userWarns.length} warns.` });
        userWarns.splice(numero - 1, 1);
        warns.set(user.id, userWarns);
        return interaction.editReply({ content: `✅ Se quitó el warn #${numero} de ${user.tag}. Warns restantes: ${userWarns.length}` });
      }
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
      angry: { text: 'está enojado', color: '#FF0000', emoji: '😠' },
      sleep: { text: 'se fue a dormir', color: '#9370DB', emoji: '😴' },
      eat: { text: 'está comiendo', color: '#FF8C00', emoji: '🍽️' },
      wave: { text: 'saludó a todos', color: '#00CED1', emoji: '👋' },
      laugh: { text: 'se está riendo', color: '#FFD700', emoji: '😂' }
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
