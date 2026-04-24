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
const caseLogs = new Map(); // caseId -> {type, user, mod, reason, date}
const userNotes = new Map(); // userId -> [{note, mod, date}]
const tempRoles = new Map(); // userId -> [{roleId, expires}]
let caseCounter = 1000;
let antiJoin = false;

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
    // MODERACIÓN - 29 COMANDOS
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
    new SlashCommandBuilder().setName('decir').setDescription('XINTOKIO envía un mensaje').addStringOption(o => o.setName('mensaje').setDescription('Mensaje').setRequired(true)),
    // NUEVOS COMANDOS DE TRACKING
    new SlashCommandBuilder().setName('modlogs').setDescription('Ve el historial de moderación de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('caselog').setDescription('Busca un caso por ID').addIntegerOption(o => o.setName('id').setDescription('ID del caso').setRequired(true)),
    new SlashCommandBuilder().setName('auditlog').setDescription('Muestra las últimas 10 acciones de moderación'),
    new SlashCommandBuilder().setName('purge').setDescription('Borra mensajes de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('cantidad').setDescription('Cantidad 1-100').setRequired(true).setMinValue(1).setMaxValue(100)),
    // NUEVOS COMANDOS DE CONTROL
    new SlashCommandBuilder().setName('nickname').setDescription('Cambia el apodo de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('apodo').setDescription('Nuevo apodo').setRequired(true)),
    new SlashCommandBuilder().setName('softban').setDescription('Banea y desbanea para borrar mensajes').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('temprole').setDescription('Da un rol temporal').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)).addIntegerOption(o => o.setName('horas').setDescription('Horas 1-168').setRequired(true).setMinValue(1).setMaxValue(168)),
    new SlashCommandBuilder().setName('notes').setDescription('Agrega nota privada a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('nota').setDescription('Nota').setRequired(true)),
    new SlashCommandBuilder().setName('usernotes').setDescription('Ve las notas de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    // NUEVOS COMANDOS ANTI-RAID
    new SlashCommandBuilder().setName('lockall').setDescription('Bloquea TODOS los canales'),
    new SlashCommandBuilder().setName('unlockall').setDescription('Desbloquea TODOS los canales'),
    new SlashCommandBuilder().setName('raidmode').setDescription('Activa/desactiva modo raid').addBooleanOption(o => o.setName('estado').setDescription('Activar o desactivar').setRequired(true)),
    new SlashCommandBuilder().setName('antijoin').setDescription('Activa/desactiva antijoin <7 días').addBooleanOption(o => o.setName('estado').setDescription('Activar o desactivar').setRequired(true))
  ].map(command => command.toJSON());

  await client.application.commands.set(commands);
  console.log('✅ 29 comandos registrados');

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
  }, Math.floor(Math.random() * 900000) + 900000);

  // CHEQUEAR ROLES TEMPORALES CADA MINUTO
  setInterval(() => {
    const now = Date.now();
    tempRoles.forEach((roles, userId) => {
      roles.forEach(async (data, index) => {
        if (now >= data.expires) {
          const guild = client.guilds.cache.first();
          const member = await guild.members.fetch(userId).catch(() => null);
          if (member) member.roles.remove(data.roleId).catch(() => {});
          roles.splice(index, 1);
        }
      });
      if (roles.length === 0) tempRoles.delete(userId);
    });
  }, 60000);
});

function addModStat(modId, type) {
  const stats = modStats.get(modId) || { bans: 0, kicks: 0, warns: 0, mutes: 0 };
  stats[type]++;
  modStats.set(modId, stats);
}

function createCase(type, userId, modId, reason) {
  caseCounter++;
  caseLogs.set(caseCounter, {
    type,
    user: userId,
    mod: modId,
    reason,
    date: new Date().toLocaleString('es-PE')
  });
  return caseCounter;
}

// ANTIRAID - KICKEA CUENTAS NUEVAS
client.on('guildMemberAdd', async member => {
  if (antiJoin && Date.now() - member.user.createdTimestamp < 7 * 24 * 60 * 60 * 1000) {
    await member.kick('Antijoin activado: cuenta <7 días').catch(() => {});
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // HELP
    if (commandName === 'help') {
      const embed = new EmbedBuilder()
.setTitle('🤖 Comandos de XINTOKIO')
.setColor('#FF69B4')
.addFields(
        { name: '🔨 Moderación Básica', value: '`/ban` `/unban` `/kick` `/mute` `/unmute` `/warn` `/unwarn` `/warns` `/banlist` `/modstats`', inline: false },
        { name: '📋 Tracking/Logs', value: '`/modlogs` `/caselog` `/auditlog` `/notes` `/usernotes`', inline: false },
        { name: '🛠️ Control', value: '`/clear` `/purge` `/nickname` `/softban` `/temprole` `/lock` `/unlock` `/slowmode`', inline: false },
        { name: '🚨 Anti-Raid', value: '`/lockall` `/unlockall` `/raidmode` `/antijoin`', inline: false },
        { name: '⚙️ Utilidad', value: '`/decir` `/help`', inline: false }
      )
.setFooter({ text: 'XINTOKIO Bot | 29 comandos de moderación' });
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'ban') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'No especificada';
      await interaction.guild.members.ban(user, { reason: `Por ${interaction.user.tag}: ${reason}` });
      addModStat(interaction.user.id, 'bans');
      const caseId = createCase('ban', user.id, interaction.user.id, reason);
      const embed = new EmbedBuilder().setColor('#FF0000').setTitle('🔨 Usuario Baneado').setDescription(`**${user.tag}** fue baneado.`).addFields({ name: 'Razón', value: reason }, { name: 'Moderador', value: `${interaction.user}` }).setFooter({ text: `Caso #${caseId}` });
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
      const caseId = createCase('kick', user.id, interaction.user.id, reason);
      return interaction.editReply({ content: `👢 **${user.tag}** expulsado. Razón: ${reason}\nCaso #${caseId}` });
    }

    if (commandName === 'mute') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const minutos = interaction.options.getInteger('minutos');
      const reason = interaction.options.getString('razon') || 'No especificada';
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(minutos * 60 * 1000, `Por ${interaction.user.tag}: ${reason}`);
      addModStat(interaction.user.id, 'mutes');
      const caseId = createCase('mute', user.id, interaction.user.id, reason);
      return interaction.editReply({ content: `🔇 **${user.tag}** muteado ${minutos} min. Razón: ${reason}\nCaso #${caseId}` });
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
      const caseId = createCase('warn', user.id, interaction.user.id, reason);
      const embed = new EmbedBuilder().setColor('#FFFF00').setTitle('⚠️ Advertencia').setDescription(`${user} has sido advertido.`).addFields({ name: 'Razón', value: reason }, { name: 'Moderador', value: `${interaction.user}` }, { name: 'Total warns', value: `${userWarns.length}` }).setFooter({ text: `Caso #${caseId}` });
      await interaction.channel.send({ content: `${user}`, embeds: [embed] });
      return interaction.editReply({ content: `✅ ${user.tag} advertido. Total: ${userWarns.length} | Caso #${caseId}` });
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

    if (commandName === 'modlogs') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const userCases = Array.from(caseLogs.entries()).filter(([id, c]) => c.user === user.id).slice(-10);
      if (userCases.length === 0) return interaction.editReply({ content: `✅ ${user.tag} no tiene casos.` });

      const embed = new EmbedBuilder()
.setTitle(`📋 ModLogs de ${user.tag}`)
.setColor('#FFA500')
.setDescription(userCases.map(([id, c]) => `**Caso #${id}** - ${c.type.toUpperCase()}\n**Razón:** ${c.reason}\n**Mod:** <@${c.mod}>\n**Fecha:** ${c.date}`).join('\n\n'));
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'caselog') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const id = interaction.options.getInteger('id');
      const caso = caseLogs.get(id);
      if (!caso) return interaction.editReply({ content: '❌ Caso no encontrado.' });

      const embed = new EmbedBuilder()
.setTitle(`📋 Caso #${id}`)
.setColor('#00BFFF')
.addFields(
        { name: 'Tipo', value: caso.type.toUpperCase(), inline: true },
        { name: 'Usuario', value: `<@${caso.user}>`, inline: true },
        { name: 'Moderador', value: `<@${caso.mod}>`, inline: true },
        { name: 'Razón', value: caso.reason, inline: false },
        { name: 'Fecha', value: caso.date, inline: false }
      );
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'auditlog') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const lastCases = Array.from(caseLogs.entries()).slice(-10).reverse();
      if (lastCases.length === 0) return interaction.editReply({ content: '✅ No hay casos registrados aún.' });

      const embed = new EmbedBuilder()
.setTitle(`📋 Últimas 10 acciones de moderación`)
.setColor('#00BFFF')
.setDescription(lastCases.map(([id, c]) => `**#${id}** - ${c.type.toUpperCase()} a <@${c.user}>\n**Mod:** <@${c.mod}> | **Razón:** ${c.reason}`).join('\n\n'));
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'purge') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar mensajes`.' });
      const user = interaction.options.getUser('usuario');
      const cantidad = interaction.options.getInteger('cantidad');
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const userMessages = messages.filter(m => m.author.id === user.id).first(cantidad);
      const deleted = await interaction.channel.bulkDelete(userMessages, true);
      return interaction.editReply({ content: `🗑️ Borré ${deleted.size} mensajes de ${user.tag}.` });
    }

    if (commandName === 'nickname') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageNicknames)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar apodos`.' });
      const user = interaction.options.getUser('usuario');
      const apodo = interaction.options.getString('apodo');
      const member = await interaction.guild.members.fetch(user.id);
      await member.setNickname(apodo);
      return interaction.editReply({ content: `✅ Apodo de ${user.tag} cambiado a \`${apodo}\`.` });
    }

    if (commandName === 'softban') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Softban';
      await interaction.guild.members.ban(user, { deleteMessageDays: 7, reason: `Softban por ${interaction.user.tag}: ${reason}` });
      await interaction.guild.members.unban(user.id, 'Softban - desbaneo automático');
      const caseId = createCase('softban', user.id, interaction.user.id, reason);
      return interaction.editReply({ content: `✅ **${user.tag}** softbaneado. Se borraron sus mensajes. Caso #${caseId}` });
    }

    if (commandName === 'temprole') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar roles`.' });
      const user = interaction.options.getUser('usuario');
      const role = interaction.options.getRole('rol');
      const horas = interaction.options.getInteger('horas');
      const member = await interaction.guild.members.fetch(user.id);
      await member.roles.add(role);
      const expires = Date.now() + (horas * 60 * 60 * 1000);
      const roles = tempRoles.get(user.id) || [];
      roles.push({ roleId: role.id, expires });
      tempRoles.set(user.id, roles);
      return interaction.editReply({ content: `✅ Rol ${role.name} agregado a ${user.tag} por ${horas}h.` });
    }

    if (commandName === 'notes') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const nota = interaction.options.getString('nota');
      const notes = userNotes.get(user.id) || [];
      notes.push({ note: nota, mod: interaction.user.tag, date: new Date().toLocaleDateString('es-PE') });
      userNotes.set(user.id, notes);
      return interaction.editReply({ content: `✅ Nota agregada a ${user.tag}.` });
    }

    if (commandName === 'usernotes') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const notes = userNotes.get(user.id) || [];
      if (notes.length === 0) return interaction.editReply({ content: `✅ ${user.tag} no tiene notas.` });

      const embed = new EmbedBuilder()
.setTitle(`📝 Notas de ${user.tag}`)
.setColor('#9370DB')
.setDescription(notes.map((n, i) => `**Nota #${i + 1}**\n${n.note}\n**Mod:** ${n.mod} | **Fecha:** ${n.date}`).join('\n\n'));
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'lockall') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar canales`.' });
      const channels = interaction.guild.channels.cache.filter(c => c.isTextBased());
      channels.forEach(ch => ch.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false }).catch(() => {}));
      return interaction.editReply({ content: `🔒 ${channels.size} canales bloqueados.` });
    }

    if (commandName === 'unlockall') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar canales`.' });
      const channels = interaction.guild.channels.cache.filter(c => c.isTextBased());
      channels.forEach(ch => ch.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null }).catch(() => {}));
      return interaction.editReply({ content: `🔓 ${channels.size} canales desbloqueados.` });
    }

    if (commandName === 'raidmode') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar servidor`.' });
      const estado = interaction.options.getBoolean('estado');
      if (estado) {
        await interaction.guild.setVerificationLevel(3); // Alto
        await interaction.guild.setExplicitContentFilter(2); // Todo
        return interaction.editReply({ content: '🚨 Modo raid ACTIVADO. Verificación alta + filtro explícito.' });
      } else {
        await interaction.guild.setVerificationLevel(1); // Bajo
        return interaction.editReply({ content: '✅ Modo raid DESACTIVADO.' });
      }
    }

    if (commandName === 'antijoin') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const estado = interaction.options.getBoolean('estado');
      antiJoin = estado;
      return interaction.editReply({ content: estado? '✅ Antijoin ACTIVADO. Se kickean cuentas <7 días.' : '✅ Antijoin DESACTIVADO.' });
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
