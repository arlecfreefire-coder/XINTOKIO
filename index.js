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

// 3. Base de datos simple
const warns = new Map(); // userId -> [{reason, mod, date}]
const modStats = new Map(); // modId -> {bans: 0, kicks: 0, warns: 0, mutes: 0}

// MENSAJES ALEATORIOS - TUS FRASES CON EMOJIS
const mensajesRandom = [
  '😡Portense bien los estoy viendo',
  '😿OH QUE VEN MIS OIDOS',
  '🐩lulu mi perrita',
  '🫢Sabias que siempre estoy aquí',
  '😶Kyo',
  '🥶Sam nya~ deja de tocarte 😣',
  '😳No más links',
  '😤Nuevos verificación okey?',
  '😴Hora de dormír',
  '🤖Los vigilo 24/7'
];

// 4. Evento ready
client.once('ready', async () => {
  console.log(`✅ XINTOKIO online como ${client.user.tag}`);
  const commands = [
    // MODERACIÓN - 16 COMANDOS
    new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos'),
    new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unban').setDescription('Desbanea a un usuario').addStringOption(o => o.setName('userid').setDescription('ID del usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('kick').setDescription('Expulsa a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('mute').setDescription('Silencia a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('minutos').setDescription('Minutos 1-10080').setRequired(true).setMinValue(1).setMaxValue(10080)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unmute').setDescription('Quita el timeout').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Advierte a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(true)),
    new SlashCommandBuilder().setName('unwarn').setDescription('Quita un warn a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('numero').setDescription('Número de warn a quitar. Deja vacío para quitar todos').setMinValue(1)),
    new SlashCommandBuilder().setName('warns').setDescription('Muestra los warns de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('banlist').setDescription('Muestra la lista de baneados del servidor'),
    new SlashCommandBuilder().setName('modstats').setDescription('Muestra stats de moderación de un mod').addUserOption(o => o.setName('moderador').setDescription('Moderador')),
    new SlashCommandBuilder().setName('clear').setDescription('Borra mensajes').addIntegerOption(o => o.setName('cantidad').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100)),
    new SlashCommandBuilder().setName('lock').setDescription('Bloquea el canal').addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unlock').setDescription('Desbloquea el canal'),
    new SlashCommandBuilder().setName('slowmode').setDescription('Activa modo lento').addIntegerOption(o => o.setName('segundos').setDescription('0-21600. 0 quita').setRequired(true).setMinValue(0).setMaxValue(21600)),
    new SlashCommandBuilder().setName('decir').setDescription('XINTOKIO envía un mensaje').addStringOption(o => o.setName('mensaje').setDescription('Mensaje').setRequired(true))
  ].map(command => command.toJSON());

  await client.application.commands.set(commands);
  console.log('✅ 16 comandos registrados');

  // MENSAJES ALEATORIOS CADA 15-30 MIN
  setInterval(() => {
    const guilds = client.guilds.cache;
    guilds.forEach(guild => {
      const channel = guild.systemChannel || guild.channels.cache.find(c => c.name.includes('general') || c.name.includes('chat') || c.name.includes('principal'));
      if (channel && channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)) {
        const msg = mensajesRandom[Math.floor(Math.random() * mensajesRandom.length)];
        channel.send(msg).catch(() => {});
      }
    });
  }, Math.floor(Math.random() * 900000) + 900000); // 15-30 min
});

function addModStat(modId, type) {
  const stats = modStats.get(modId) || { bans: 0, kicks: 0, warns: 0, mutes: 0 };
  stats[type]++;
  modStats.set(modId, stats);
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    // TODOS LOS COMANDOS SON EFÍMEROS - SOLO TÚ LOS VES
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // HELP
    if (commandName === 'help') {
      const embed = new EmbedBuilder()
.setTitle('🤖 Comandos de XINTOKIO')
.setColor('#FF69B4')
.addFields(
        { name: '🔨 Moderación', value: '`/ban` `/unban` `/kick` `/mute` `/unmute` `/warn` `/unwarn` `/warns` `/banlist` `/modstats` `/clear` `/lock` `/unlock` `/slowmode`', inline: false },
        { name: '⚙️ Utilidad', value: '`/decir` `/help`', inline: false }
      )
.setFooter({ text: 'XINTOKIO Bot | Moderación Completa - 16 comandos' });
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'ban') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'No especificada';
      await interaction.guild.members.ban(user, { reason: `Por ${interaction.user.tag}: ${reason}` });
      addModStat(interaction.user.id, 'bans');
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
      addModStat(interaction.user.id, 'kicks');
      return interaction.editReply({ content: `👢 **${user.tag}** expulsado. Razón: ${reason}` });
    }

    if (commandName === 'mute') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const minutos = interaction.options.getInteger('minutos');
      const reason = interaction.options.getString('razon') || 'No especificada';
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(minutos * 60 * 1000, `Por ${interaction.user.tag}: ${reason}`);
      addModStat(interaction.user.id, 'mutes');
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
      userWarns.push({ reason, mod: interaction.user.tag, date: new Date().toLocaleDateString('es-PE') });
      warns.set(user.id, userWarns);
      addModStat(interaction.user.id, 'warns');
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

    if (commandName === 'warns') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const userWarns = warns.get(user.id) || [];
      if (userWarns.length === 0) return interaction.editReply({ content: `✅ ${user.tag} no tiene warns.` });

      const embed = new EmbedBuilder()
.setTitle(`⚠️ Warns de ${user.tag}`)
.setColor('#FFFF00')
.setDescription(`Total: ${userWarns.length}`)
.addFields(userWarns.map((w, i) => ({
          name: `Warn #${i + 1}`,
          value: `**Razón:** ${w.reason}\n**Mod:** ${w.mod}\n**Fecha:** ${w.date}`,
          inline: false
        })));
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'banlist') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const bans = await interaction.guild.bans.fetch();
      if (bans.size === 0) return interaction.editReply({ content: '✅ No hay usuarios baneados.' });

      const banList = bans.map(b => `**${b.user.tag}** (${b.user.id})\nRazón: ${b.reason || 'No especificada'}`).slice(0, 10).join('\n\n');
      const embed = new EmbedBuilder()
.setTitle(`🔨 Lista de Baneados - ${bans.size} total`)
.setColor('#FF0000')
.setDescription(banList)
.setFooter({ text: 'Mostrando los primeros 10' });
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'modstats') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const mod = interaction.options.getUser('moderador') || interaction.user;
      const stats = modStats.get(mod.id) || { bans: 0, kicks: 0, warns: 0, mutes: 0 };
      const embed = new EmbedBuilder()
.setTitle(`📊 Stats de ${mod.tag}`)
.setColor('#00BFFF')
.addFields(
        { name: '🔨 Bans', value: `${stats.bans}`, inline: true },
        { name: '👢 Kicks', value: `${stats.kicks}`, inline: true },
        { name: '⚠️ Warns', value: `${stats.warns}`, inline: true },
        { name: '🔇 Mutes', value: `${stats.mutes}`, inline: true }
      );
      return interaction.editReply({ embeds: [embed] });
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
