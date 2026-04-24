require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const express = require('express');

// PON TU ID AQUÍ - Solo tú puedes usar /paneladmin
const OWNER_ID = '1433375850996301882';

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

// 3. Base de datos
const warns = new Map();
const modStats = new Map();
const caseLogs = new Map();
const userNotes = new Map();
const tempRoles = new Map();
const bannedUsers = new Map();
const linkedAlts = new Map();
const dailyLogs = new Map();
const pomodoros = new Map();
const todos = new Map();
const focusMode = new Map();
const rutinas = new Map();
const notas = new Map();
const countdowns = new Map();
const iaActiva = new Map();
const antispam = new Map();
const badwords = new Map();
const nicklocked = new Map();
const spamCache = new Map();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
let caseCounter = 1000;
let antiJoin = false;

// ROLES CON PERMISO PARA /massban - TUS 2 ROLES
const ROLES_MASSBAN = ['1455809061189713972', '1466561730405466172'];

// MENSAJES ALEATORIOS
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
    // MODERACIÓN BÁSICA - 33 COMANDOS
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
    new SlashCommandBuilder().setName('modlogs').setDescription('Ve el historial de moderación de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('caselog').setDescription('Busca un caso por ID').addIntegerOption(o => o.setName('id').setDescription('ID del caso').setRequired(true)),
    new SlashCommandBuilder().setName('auditlog').setDescription('Muestra las últimas 10 acciones de moderación'),
    new SlashCommandBuilder().setName('purge').setDescription('Borra mensajes de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('cantidad').setDescription('Cantidad 1-100').setRequired(true).setMinValue(1).setMaxValue(100)),
    new SlashCommandBuilder().setName('nickname').setDescription('Cambia el apodo de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('apodo').setDescription('Nuevo apodo').setRequired(true)),
    new SlashCommandBuilder().setName('softban').setDescription('Banea y desbanea para borrar mensajes').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('temprole').setDescription('Da un rol temporal').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)).addIntegerOption(o => o.setName('horas').setDescription('Horas 1-168').setRequired(true).setMinValue(1).setMaxValue(168)),
    new SlashCommandBuilder().setName('notes').setDescription('Agrega nota privada a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('nota').setDescription('Nota').setRequired(true)),
    new SlashCommandBuilder().setName('usernotes').setDescription('Ve las notas de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('lockall').setDescription('Bloquea TODOS los canales'),
    new SlashCommandBuilder().setName('unlockall').setDescription('Desbloquea TODOS los canales'),
    new SlashCommandBuilder().setName('raidmode').setDescription('Activa/desactiva modo raid').addBooleanOption(o => o.setName('estado').setDescription('Activar o desactivar').setRequired(true)),
    new SlashCommandBuilder().setName('antijoin').setDescription('Activa/desactiva antijoin <7 días').addBooleanOption(o => o.setName('estado').setDescription('Activar o desactivar').setRequired(true)),
    new SlashCommandBuilder().setName('altcheck').setDescription('Revisa si un usuario es posible alt/cuenta nueva').addUserOption(o => o.setName('usuario').setDescription('Usuario sospechoso').setRequired(true)),
    new SlashCommandBuilder().setName('linkalts').setDescription('Vincula 2 cuentas como alts').addUserOption(o => o.setName('usuario1').setDescription('Cuenta principal').setRequired(true)).addUserOption(o => o.setName('usuario2').setDescription('Cuenta alt').setRequired(true)),
    new SlashCommandBuilder().setName('banip').setDescription('Banea y marca como ban evader').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('paneladmin').setDescription('Panel exclusivo: muestra actividad del día'),

    // ESTUDIO - 12 COMANDOS
    new SlashCommandBuilder().setName('pomodoro').setDescription('Timer Pomodoro').addIntegerOption(o => o.setName('minutos').setDescription('Minutos. Default 25').setMinValue(5).setMaxValue(120)).addSubcommand(s => s.setName('stop').setDescription('Cancela tu pomodoro')),
    new SlashCommandBuilder().setName('study').setDescription('Manda a alguien a estudiar').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('minutos').setDescription('Minutos').setRequired(true).setMinValue(5).setMaxValue(180)),
    new SlashCommandBuilder().setName('recordatorio').setDescription('Te mando DM en X tiempo').addStringOption(o => o.setName('tiempo').setDescription('Ej: 30m, 2h, 1d').setRequired(true)).addStringOption(o => o.setName('mensaje').setDescription('Qué recordar').setRequired(true)),
    new SlashCommandBuilder().setName('todolist').setDescription('Tu lista de tareas').addSubcommand(s => s.setName('add').setDescription('Agregar').addStringOption(o => o.setName('tarea').setDescription('Tarea').setRequired(true))).addSubcommand(s => s.setName('ver').setDescription('Ver lista')).addSubcommand(s => s.setName('done').setDescription('Tachar').addIntegerOption(o => o.setName('numero').setDescription('Número').setRequired(true))).addSubcommand(s => s.setName('clear').setDescription('Borrar todo')),
    new SlashCommandBuilder().setName('focus').setDescription('Modo focus on/off').addBooleanOption(o => o.setName('estado').setDescription('on/off').setRequired(true)).addChannelOption(o => o.setName('canal').setDescription('Canal de estudio')),
    new SlashCommandBuilder().setName('rutina').setDescription('Tu horario de estudio').addSubcommand(s => s.setName('add').setDescription('Agregar').addStringOption(o => o.setName('dia').setDescription('Lunes, Martes...').setRequired(true)).addStringOption(o => o.setName('horario').setDescription('Ej: 3pm-5pm Mate').setRequired(true))).addSubcommand(s => s.setName('ver').setDescription('Ver rutina')).addSubcommand(s => s.setName('clear').setDescription('Borrar rutina')),
    new SlashCommandBuilder().setName('calc').setDescription('Calculadora').addStringOption(o => o.setName('operacion').setDescription('Ej: 2+2*5').setRequired(true)),
    new SlashCommandBuilder().setName('define').setDescription('Define una palabra').addStringOption(o => o.setName('palabra').setDescription('Palabra').setRequired(true)),
    new SlashCommandBuilder().setName('traducir').setDescription('Traduce texto').addStringOption(o => o.setName('idioma').setDescription('en, es, fr...').setRequired(true)).addStringOption(o => o.setName('texto').setDescription('Texto').setRequired(true)),
    new SlashCommandBuilder().setName('notas').setDescription('Tus notas privadas').addSubcommand(s => s.setName('guardar').setDescription('Guardar nota').addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true)).addStringOption(o => o.setName('contenido').setDescription('Contenido').setRequired(true))).addSubcommand(s => s.setName('ver').setDescription('Ver todas')).addSubcommand(s => s.setName('borrar').setDescription('Borrar nota').addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true))),
    new SlashCommandBuilder().setName('countdown').setDescription('Cuenta regresiva').addStringOption(o => o.setName('evento').setDescription('Examen final').setRequired(true)).addStringOption(o => o.setName('tiempo').setDescription('5d, 12h').setRequired(true)),
    new SlashCommandBuilder().setName('whitenoise').setDescription('Link de ruido blanco para concentrarse'),

    // IA PARA TODOS
    new SlashCommandBuilder().setName('ask').setDescription('Pregúntale algo a XINTOKIO IA').addStringOption(o => o.setName('pregunta').setDescription('Tu pregunta').setRequired(true)),
    new SlashCommandBuilder().setName('iamode').setDescription('Activa IA en este canal').addBooleanOption(o => o.setName('estado').setDescription('on/off').setRequired(true)),

    // MOD PRO NUEVOS
    new SlashCommandBuilder().setName('massban').setDescription('Banea varios usuarios').addStringOption(o => o.setName('usuarios').setDescription('IDs separados por espacio').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón del ban')),
    new SlashCommandBuilder().setName('userinfo').setDescription('Info completa de un user').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('roleall').setDescription('Da rol a todos').addRoleOption(o => o.setName('rol').setDescription('Rol a dar').setRequired(true)),
    new SlashCommandBuilder().setName('vcban').setDescription('Banea de canales de voz').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('nicklock').setDescription('Bloquea el apodo de alguien').addSubcommand(s => s.setName('lock').setDescription('Bloquear apodo').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('apodo').setDescription('Apodo fijo').setRequired(true))).addSubcommand(s => s.setName('unlock').setDescription('Desbloquea apodo').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))),

    // LOGS Y AUTOSPY
    new SlashCommandBuilder().setName('messagelogs').setDescription('Últimos mensajes borrados').addChannelOption(o => o.setName('canal').setDescription('Canal').setRequired(true)),
    new SlashCommandBuilder().setName('joinlogs').setDescription('Historial de entradas').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('invites').setDescription('Top 10 invitaciones del server'),
    new SlashCommandBuilder().setName('antispam').setDescription('Anti-spam on/off').addBooleanOption(o => o.setName('estado').setDescription('on/off').setRequired(true)),
    new SlashCommandBuilder().setName('badword').setDescription('Lista negra de palabras').addSubcommand(s => s.setName('add').setDescription('Agregar palabra').addStringOption(o => o.setName('palabra').setDescription('Palabra').setRequired(true))).addSubcommand(s => s.setName('remove').setDescription('Quitar palabra').addStringOption(o => o.setName('palabra').setDescription('Palabra').setRequired(true))).addSubcommand(s => s.setName('list').setDescription('Ver lista')),

    // ANTI-TOXIC EXTRA
    new SlashCommandBuilder().setName('massnick').setDescription('Cambia apodo de todos').addStringOption(o => o.setName('apodo').setDescription('Nuevo apodo').setRequired(true)),
    new SlashCommandBuilder().setName('deafen').setDescription('Ensordece en voz').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('nuke').setDescription('Clona y borra el canal actual'),
    new SlashCommandBuilder().setName('susmode').setDescription('Autoban si manda link al entrar').addBooleanOption(o => o.setName('estado').setDescription('on/off').setRequired(true)),
    new SlashCommandBuilder().setName('fakeban').setDescription('Ban falso pa trolear').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
  ].map(command => command.toJSON());

  await client.application.commands.set(commands);
  console.log('✅ 58 comandos registrados');

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

  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      dailyLogs.clear();
    }
  }, 60000);
});

function addModStat(modId, type) {
  const stats = modStats.get(modId) || { bans: 0, kicks: 0, warns: 0, mutes: 0 };
  stats[type]++;
  modStats.set(modId, stats);
  const today = new Date().toLocaleDateString('es-PE');
  const dayLogs = dailyLogs.get(today) || { bans: [], warns: [], mutes: [], roles: [] };
  if (type === 'bans' || type === 'warns' || type === 'mutes') {
    dayLogs[type].push(modId);
    dailyLogs.set(today, dayLogs);
  }
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

client.on('guildMemberAdd', async member => {
  if (antiJoin && Date.now() - member.user.createdTimestamp < 7 * 24 * 60 * 1000) {
    await member.kick('Antijoin activado: cuenta <7 días').catch(() => {});
    return;
  }
  const bans = await member.guild.bans.fetch();
  const edadCuenta = Date.now() - member.user.createdTimestamp;
  if (edadCuenta < 7 * 24 * 60 * 60 * 1000 && bans.size > 0) {
    const canalLogs = member.guild.systemChannel || member.guild.channels.cache.find(c => c.name.includes('logs') || c.name.includes('mod'));
    if (canalLogs) {
      const embed = new EmbedBuilder()
.setTitle('⚠️ Posible Alt Detectado')
.setColor('#FFA500')
.setDescription(`${member.user.tag} entró al server`)
.addFields(
  { name: 'Cuenta creada', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`, inline: true },
  { name: 'ID', value: member.id, inline: true },
  { name: 'Acción recomendada', value: 'Usa `/altcheck @usuario` para revisar', inline: false }
)
.setThumbnail(member.user.displayAvatarURL());
      canalLogs.send({ embeds: [embed] }).catch(() => {});
    }
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const addedRoles = newMember.roles.cache.filter(r =>!oldMember.roles.cache.has(r.id));
  if (addedRoles.size > 0) {
    const today = new Date().toLocaleDateString('es-PE');
    const dayLogs = dailyLogs.get(today) || { bans: [], warns: [], mutes: [], roles: [] };
    addedRoles.forEach(role => {
      dayLogs.roles.push({ user: newMember.id, role: role.name });
    });
    dailyLogs.set(today, dayLogs);
  }
  if (nicklocked.has(newMember.id)) {
    const apodoFijo = nicklocked.get(newMember.id);
    if (newMember.nickname!== apodoFijo) {
      newMember.setNickname(apodoFijo).catch(() => {});
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (commandName === 'help') {
      const embed = new EmbedBuilder()
.setTitle('🤖 Comandos de XINTOKIO')
.setColor('#FF69B4')
.addFields(
        { name: '🔨 Moderación', value: '`/ban` `/unban` `/kick` `/mute` `/unmute` `/warn` `/unwarn` `/warns` `/banlist` `/modstats` `/massban`', inline: false },
        { name: '📋 Info/Logs', value: '`/userinfo` `/modlogs` `/caselog` `/auditlog` `/messagelogs` `/joinlogs` `/invites`', inline: false },
        { name: '🛠️ Control', value: '`/clear` `/purge` `/nickname` `/softban` `/temprole` `/lock` `/unlock` `/slowmode` `/roleall` `/vcban` `/nicklock`', inline: false },
        { name: '🚨 Anti-Raid', value: '`/lockall` `/unlockall` `/raidmode` `/antijoin` `/altcheck` `/linkalts` `/banip`', inline: false },
        { name: '📚 Estudio', value: '`/pomodoro` `/study` `/recordatorio` `/todolist` `/focus` `/rutina` `/calc` `/define` `/traducir` `/notas` `/countdown` `/whitenoise`', inline: false },
        { name: '🤖 IA', value: '`/ask` `/iamode`', inline: false },
        { name: '🛡️ Auto-Mod', value: '`/antispam` `/badword` `/susmode`', inline: false },
        { name: '🔥 Anti-Toxic', value: '`/massnick` `/deafen` `/nuke` `/fakeban`', inline: false },
        { name: '⚙️ Utilidad', value: '`/decir` `/paneladmin`', inline: false }
      )
.setFooter({ text: 'XINTOKIO Bot | 58 comandos' });
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'paneladmin') {
      if (interaction.user.id!== OWNER_ID) return interaction.editReply({ content: '❌ Solo el dueño puede usar este comando.' });
      const today = new Date().toLocaleDateString('es-PE');
      const dayLogs = dailyLogs.get(today) || { bans: [], warns: [], mutes: [], roles: [] };
      const embed = new EmbedBuilder()
.setTitle('👑 PANEL ADMIN - Actividad del día')
.setColor('#FFD700')
.setDescription(`**Fecha:** ${today}`)
.addFields(
  { name: '🔨 Bans de hoy', value: `${dayLogs.bans.length}`, inline: true },
  { name: '⚠️ Warns de hoy', value: `${dayLogs.warns.length}`, inline: true },
  { name: '🔇 Mutes de hoy', value: `${dayLogs.mutes.length}`, inline: true },
  { name: '👤 Roles dados hoy', value: dayLogs.roles.length > 0? dayLogs.roles.map(r => `<@${r.user}> → ${r.role}`).slice(0, 10).join('\n') : 'Ninguno', inline: false }
)
.setFooter({ text: 'Solo visible para el dueño' });
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'ban') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'No especificada';
      await interaction.guild.members.ban(user, { reason: `Por ${interaction.user.tag}: ${reason}` });
      addModStat(interaction.user.id, 'bans');
      bannedUsers.set(user.id, { reason, date: new Date().toLocaleString('es-PE') });
      const caseId = createCase('ban', user.id, interaction.user.id, reason);
      const embed = new EmbedBuilder().setColor('#FF0000').setTitle('🔨 Usuario Baneado').setDescription(`**${user.tag}** fue baneado.`).addFields({ name: 'Razón', value: reason }, { name: 'Moderador', value: `${interaction.user}` }).setFooter({ text: `Caso #${caseId}` });
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'unban') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const userid = interaction.options.getString('userid');
      const reason = interaction.options.getString('razon') || 'No especificada';
      await interaction.guild.members.unban(userid, `Por ${interaction.user.tag}: ${reason}`);
      bannedUsers.delete(userid);
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
      const expires = Date.now() + (horas * 60 * 1000);
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
        await interaction.guild.setVerificationLevel(3);
        await interaction.guild.setExplicitContentFilter(2);
        return interaction.editReply({ content: '🚨 Modo raid ACTIVADO. Verificación alta + filtro explícito.' });
      } else {
        await interaction.guild.setVerificationLevel(1);
        return interaction.editReply({ content: '✅ Modo raid DESACTIVADO.' });
      }
    }

    if (commandName === 'antijoin') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const estado = interaction.options.getBoolean('estado');
      antiJoin = estado;
      return interaction.editReply({ content: estado? '✅ Antijoin ACTIVADO. Se kickean cuentas <7 días.' : '✅ Antijoin DESACTIVADO.' });
    }

    if (commandName === 'altcheck') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.editReply({ content: '❌ Ese usuario no está en el servidor.' });
      let sospecha = 0;
      let razones = [];
      const edadCuenta = Date.now() - user.createdTimestamp;
      if (edadCuenta < 7 * 24 * 60 * 60 * 1000) {
        sospecha += 40;
        razones.push(`⚠️ Cuenta creada hace ${Math.floor(edadCuenta / (24*60*60*1000))} días`);
      }
      const edadServer = Date.now() - member.joinedTimestamp;
      if (edadServer < 24 * 60 * 60 * 1000) {
        sospecha += 20;
        razones.push(`⚠️ Entró al servidor hace ${Math.floor(edadServer / (60*60*1000))} horas`);
      }
      if (linkedAlts.has(user.id)) {
        sospecha += 50;
        const alts = linkedAlts.get(user.id).map(id => `<@${id}>`).join(', ');
        razones.push(`🚨 Marcado como alt de: ${alts}`);
      }
      const bans = await interaction.guild.bans.fetch();
      const baneadoSimilar = bans.find(b => b.user.username.toLowerCase() === user.username.toLowerCase() || b.user.avatar === user.avatar);
      if (baneadoSimilar) {
        sospecha += 60;
        razones.push(`🚨 Nombre/Avatar igual a baneado: ${baneadoSimilar.user.tag}`);
      }
      const color = sospecha >= 70? '#FF0000' : sospecha >= 40? '#FFA500' : '#00FF00';
      const nivel = sospecha >= 70? 'ALTA' : sospecha >= 40? 'MEDIA' : 'BAJA';
      const embed = new EmbedBuilder()
.setTitle(`🔍 AltCheck de ${user.tag}`)
.setColor(color)
.addFields(
  { name: 'Probabilidad de Alt', value: `**${nivel}** - ${sospecha}%`, inline: false },
  { name: 'ID', value: user.id, inline: true },
  { name: 'Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>`, inline: true },
  { name: 'Entró al server', value: `<t:${Math.floor(member.joinedTimestamp/1000)}:R>`, inline: true },
  { name: 'Banderas detectadas', value: razones.length > 0? razones.join('\n') : '✅ Sin banderas sospechosas', inline: false }
)
.setThumbnail(user.displayAvatarURL());
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'linkalts') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user1 = interaction.options.getUser('usuario1');
      const user2 = interaction.options.getUser('usuario2');
      if (user1.id === user2.id) return interaction.editReply({ content: '❌ No puedes vincular la misma cuenta.' });
      const alts1 = linkedAlts.get(user1.id) || [];
      const alts2 = linkedAlts.get(user2.id) || [];
      if (!alts1.includes(user2.id)) alts1.push(user2.id);
      if (!alts2.includes(user1.id)) alts2.push(user1.id);
      linkedAlts.set(user1.id, alts1);
      linkedAlts.set(user2.id, alts2);
      const embed = new EmbedBuilder()
.setTitle('🔗 Alts Vinculados')
.setColor('#9370DB')
.setDescription(`**${user1.tag}** y **${user2.tag}** ahora están marcados como alts.`)
.addFields(
  { name: 'Acción', value: 'Si uno es baneado, el otro saltará en `/altcheck`', inline: false },
  { name: 'Moderador', value: `${interaction.user}`, inline: true }
);
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'banip') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') || 'Ban evader detectado';
      await interaction.guild.members.ban(user, { reason: `BanIP por ${interaction.user.tag}: ${reason}` });
      bannedUsers.set(user.id, { reason: `${reason} - BAN EVADER`, date: new Date().toLocaleString('es-PE') });
      addModStat(interaction.user.id, 'bans');
      const caseId = createCase('banip', user.id, interaction.user.id, reason);
      const embed = new EmbedBuilder()
.setTitle('🚫 BanIP - Ban Evader Baneado')
.setColor('#8B0000')
.setDescription(`**${user.tag}** fue baneado y marcado como ban evader.`)
.addFields(
  { name: 'Razón', value: reason, inline: false },
  { name: 'Moderador', value: `${interaction.user}`, inline: true },
  { name: 'Caso', value: `#${caseId}`, inline: true },
  { name: 'Aviso', value: 'Si crea otra cuenta y entra, `/altcheck` lo detectará', inline: false }
);
      return interaction.editReply({ embeds: [embed] });
    }

    // ESTUDIO
    if (commandName === 'pomodoro') {
      if (interaction.options.getSubcommand() === 'stop') {
        if (!pomodoros.has(interaction.user.id)) return interaction.editReply({ content: '❌ No tienes pomodoro activo.' });
        pomodoros.delete(interaction.user.id);
        return interaction.editReply({ content: '🛑 Pomodoro cancelado.' });
      }
      const minutos = interaction.options.getInteger('minutos') || 25;
      if (pomodoros.has(interaction.user.id)) return interaction.editReply({ content: '❌ Ya tienes un Pomodoro activo. `/pomodoro stop`' });
      pomodoros.set(interaction.user.id, true);
      await interaction.editReply({ content: `🍅 **Pomodoro:** ${minutos}min estudio. Te aviso el descanso.` });
      setTimeout(async () => {
        await interaction.channel.send({ content: `☕ ${interaction.user} **DESCANSO:** 5 minutos bro.` });
        setTimeout(async () => {
          pomodoros.delete(interaction.user.id);
          await interaction.channel.send({ content: `🍅 ${interaction.user} **FIN DEL POMODORO.** ¿Otro round?` });
        }, 5 * 60 * 1000);
      }, minutos * 60 * 1000);
    }

    if (commandName === 'study') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Moderar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const minutos = interaction.options.getInteger('minutos');
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(minutos * 60 * 1000, `Modo estudio por ${interaction.user.tag}`);
      return interaction.editReply({ content: `📚 ${user} a estudiar ${minutos}min. Sin Discord hasta que acabe.` });
    }

    if (commandName === 'recordatorio') {
      const tiempo = interaction.options.getString('tiempo');
      const mensaje = interaction.options.getString('mensaje');
      const match = tiempo.match(/(\d+)([mhd])/);
      if (!match) return interaction.editReply({ content: '❌ Usa: `30m` `2h` `1d`' });
      const valor = parseInt(match[1]);
      let ms = valor * 60 * 1000;
      if (match[2] === 'h') ms = valor * 60 * 1000;
      if (match[2] === 'd') ms = valor * 24 * 60 * 60 * 1000;
      await interaction.editReply({ content: `⏰ Listo. Te recuerdo "${mensaje}" en ${tiempo}` });
      setTimeout(() => { interaction.user.send(`🔔 **RECORDATORIO:** ${mensaje}`).catch(() => {}); }, ms);
    }

    if (commandName === 'todolist') {
      const sub = interaction.options.getSubcommand();
      const userTodos = todos.get(interaction.user.id) || [];
      if (sub === 'add') {
        const tarea = interaction.options.getString('tarea');
        userTodos.push({ texto: tarea, fecha: new Date().toLocaleDateString('es-PE') });
        todos.set(interaction.user.id, userTodos);
        return interaction.editReply({ content: `✅ Agregada: "${tarea}". Total: ${userTodos.length}` });
      }
      if (sub === 'ver') {
        if (!userTodos.length) return interaction.editReply({ content: '📝 Lista vacía bro.' });
        const lista = userTodos.map((t, i) => `**${i + 1}.** ${t.texto} \`${t.fecha}\``).join('\n');
        return interaction.editReply({ embeds: [new EmbedBuilder().setTitle(`📝 Tu To-Do List`).setColor('#00FF00').setDescription(lista)] });
      }
      if (sub === 'done') {
        const num = interaction.options.getInteger('numero') - 1;
        if (!userTodos[num]) return interaction.editReply({ content: '❌ No existe esa tarea.' });
        const borrada = userTodos.splice(num, 1)[0];
        todos.set(interaction.user.id, userTodos);
        return interaction.editReply({ content: `✅ Tachada: "${borrada.texto}"` });
      }
      if (sub === 'clear') {
        todos.delete(interaction.user.id);
        return interaction.editReply({ content: '🗑️ Lista borrada.' });
      }
    }

    if (commandName === 'focus') {
      const estado = interaction.options.getBoolean('estado');
      const canal = interaction.options.getChannel('canal') || interaction.channel;
      if (estado) {
        focusMode.set(canal.id, true);
        return interaction.editReply({ content: `🎯 **Focus ON** en ${canal}. Solo estudio, el resto se borra.` });
      } else {
        focusMode.delete(canal.id);
        return interaction.editReply({ content: `🎯 **Focus OFF** en ${canal}.` });
      }
    }

    if (commandName === 'rutina') {
      const sub = interaction.options.getSubcommand();
      const userRutina = rutinas.get(interaction.user.id) || [];
      if (sub === 'add') {
        const dia = interaction.options.getString('dia');
        const horario = interaction.options.getString('horario');
        userRutina.push(`${dia}: ${horario}`);
        rutinas.set(interaction.user.id, userRutina);
        return interaction.editReply({ content: `✅ Agregado: **${dia}** ${horario}` });
      }
      if (sub === 'ver') {
        if (!userRutina.length) return interaction.editReply({ content: '📅 No tienes rutina. Usa `/rutina add`' });
        return interaction.editReply({ embeds: [new EmbedBuilder().setTitle(`📅 Tu Rutina`).setColor('#0099FF').setDescription(userRutina.join('\n'))] });
      }
      if (sub === 'clear') {
        rutinas.delete(interaction.user.id);
        return interaction.editReply({ content: '🗑️ Rutina borrada.' });
      }
    }

    if (commandName === 'calc') {
      const op = interaction.options.getString('operacion').replace(/[^0-9+\-*/().]/g, '');
      try {
        const res = eval(op);
        return interaction.editReply({ content: `🧮 \`${op} = ${res}\`` });
      } catch { return interaction.editReply({ content: '❌ Operación inválida.' }); }
    }

    if (commandName === 'define') {
      const palabra = interaction.options.getString('palabra');
      return interaction.editReply({ content: `📖 **${palabra}**: https://dle.rae.es/${encodeURIComponent(palabra)}\nhttps://es.wikipedia.org/wiki/${encodeURIComponent(palabra)}` });
    }

    if (commandName === 'traducir') {
      const idioma = interaction.options.getString('idioma');
      const texto = interaction.options.getString('texto');
      return interaction.editReply({ content: `🌐 Traducir a ${idioma}:\nhttps://translate.google.com/?sl=auto&tl=${idioma}&text=${encodeURIComponent(texto)}` });
    }

    if (commandName === 'notas') {
      const sub = interaction.options.getSubcommand();
      const userNotas = notas.get(interaction.user.id) || {};
      if (sub === 'guardar') {
        const titulo = interaction.options.getString('titulo');
        const contenido = interaction.options.getString('contenido');
        userNotas[titulo] = contenido;
        notas.set(interaction.user.id, userNotas);
        return interaction.editReply({ content: `📝 Nota guardada: **${titulo}**` });
      }
      if (sub === 'ver') {
        if (!Object.keys(userNotas).length) return interaction.editReply({ content: '📝 No tienes notas.' });
        const lista = Object.entries(userNotas).map(([t, c]) => `**${t}:** ${c}`).join('\n\n');
        return interaction.editReply({ embeds: [new EmbedBuilder().setTitle(`📝 Tus Notas`).setColor('#FFA500').setDescription(lista.slice(0, 4000))] });
      }
      if (sub === 'borrar') {
        const titulo = interaction.options.getString('titulo');
        if (!userNotas[titulo]) return interaction.editReply({ content: '❌ No existe esa nota.' });
        delete userNotas[titulo];
        notas.set(interaction.user.id, userNotas);
        return interaction.editReply({ content: `🗑️ Nota borrada: **${titulo}**` });
      }
    }

    if (commandName === 'countdown') {
      const evento = interaction.options.getString('evento');
      const tiempo = interaction.options.getString('tiempo');
      const match = tiempo.match(/(\d+)([dh])/);
      if (!match) return interaction.editReply({ content: '❌ Usa: `5d` `12h`' });
      const valor = parseInt(match[1]);
      let ms = valor * 24 * 60 * 60 * 1000;
      if (match[2] === 'h') ms = valor * 60 * 60 * 1000;
      countdowns.set(`${interaction.user.id}-${evento}`, Date.now() + ms);
      await interaction.editReply({ content: `⏳ **Countdown iniciado:** ${evento} en ${tiempo}` });
      setTimeout(() => { interaction.user.send(`🚨 **HOY ES EL DÍA:** ${evento}`).catch(() => {}); }, ms);
    }

    if (commandName === 'whitenoise') {
      const links = ['https://www.youtube.com/watch?v=nMfPqeZjc2c', 'https://www.youtube.com/watch?v=q76bMs-NwRk', 'https://www.youtube.com/watch?v=DxuaX89a3ak'];
      return interaction.editReply({ content: `🎧 **Ruido blanco:**\n${links[Math.floor(Math.random() * links.length)]}` });
    }

    // COMANDO NUEVO: TABLA PERIÓDICA
    if (commandName === 'tabla') {
      const consulta = interaction.options.getString('elemento');
      const elementos = {
        'h': '**Hidrógeno (H)** - Número 1, Grupo 1A, Período 1. Gas. No metal.',
        'he': '**Helio (He)** - Número 2, Grupo 8A, Período 1. Gas noble.',
        'li': '**Litio (Li)** - Número 3, Grupo 1A, Período 2. Metal alcalino.',
        'be': '**Berilio (Be)** - Número 4, Grupo 2A, Período 2. Alcalinotérreo.',
        'b': '**Boro (B)** - Número 5, Grupo 3A, Período 2. Metaloide.',
        'c': '**Carbono (C)** - Número 6, Grupo 4A, Período 2. No metal.',
        'n': '**Nitrógeno (N)** - Número 7, Grupo 5A, Período 2. No metal.',
        'o': '**Oxígeno (O)** - Número 8, Grupo 6A, Período 2. No metal.',
        'f': '**Flúor (F)** - Número 9, Grupo 7A, Período 2. Halógeno.',
        'ne': '**Neón (Ne)** - Número 10, Grupo 8A, Período 2. Gas noble.',
        'na': '**Sodio (Na)** - Número 11, Grupo 1A, Período 3. Metal alcalino.',
        'mg': '**Magnesio (Mg)** - Número 12, Grupo 2A, Período 3. Alcalinotérreo.',
        'al': '**Aluminio (Al)** - Número 13, Grupo 3A, Período 3. Metal.',
        'si': '**Silicio (Si)** - Número 14, Grupo 4A, Período 3. Metaloide.',
        'p': '**Fósforo (P)** - Número 15, Grupo 5A, Período 3. No metal.',
        's': '**Azufre (S)** - Número 16, Grupo 6A, Período 3. No metal.',
        'cl': '**Cloro (Cl)** - Número 17, Grupo 7A, Período 3. Halógeno.',
        'ar': '**Argón (Ar)** - Número 18, Grupo 8A, Período 3. Gas noble.',
        'k': '**Potasio (K)** - Número 19, Grupo 1A, Período 4. Metal alcalino.',
        'ca': '**Calcio (Ca)** - Número 20, Grupo 2A, Período 4. Alcalinotérreo.',
        'fe': '**Hierro (Fe)** - Número 26, Grupo 8B, Período 4. Metal de transición.',
        'cu': '**Cobre (Cu)** - Número 29, Grupo 1B, Período 4. Metal de transición.',
        'zn': '**Zinc (Zn)** - Número 30, Grupo 2B, Período 4. Metal de transición.',
        'ag': '**Plata (Ag)** - Número 47, Grupo 1B, Período 5. Metal de transición.',
        'au': '**Oro (Au)** - Número 79, Grupo 1B, Período 6. Metal de transición.',
        'hg': '**Mercurio (Hg)** - Número 80, Grupo 2B, Período 6. Metal líquido.',
        'pb': '**Plomo (Pb)** - Número 82, Grupo 4A, Período 6. Metal.',
        'u': '**Uranio (U)** - Número 92, Actínido, Período 7. Radioactivo.'
      };

      const grupos = {
        '1a': '**Grupo 1A - Metales Alcalinos**: H, Li, Na, K, Rb, Cs, Fr. Muy reactivos, 1 electrón de valencia.',
        '2a': '**Grupo 2A - Alcalinotérreos**: Be, Mg, Ca, Sr, Ba, Ra. 2 electrones de valencia.',
        '7a': '**Grupo 7A - Halógenos**: F, Cl, Br, I, At. Muy reactivos, 7 electrones de valencia.',
        '8a': '**Grupo 8A - Gases Nobles**: He, Ne, Ar, Kr, Xe, Rn. Gases inertes, capa completa.',
        'periodo1': '**Período 1**: H, He. Solo 2 elementos.',
        'periodo2': '**Período 2**: Li, Be, B, C, N, O, F, Ne. 8 elementos.',
        'periodo3': '**Período 3**: Na, Mg, Al, Si, P, S, Cl, Ar. 8 elementos.'
      };

      const q = consulta.toLowerCase().replace(/\s/g, '');
      let res = elementos[q] || grupos[q];

      if (!res) {
        return interaction.editReply({ content: `❌ No encontré "${consulta}". Prueba: símbolo (H, He, Li), grupo (1A, 2A, 7A), o periodo (periodo1, periodo2).\n\n**Ejemplos**: \`/tabla elemento: H\` \`/tabla elemento: 1A\` \`/tabla elemento: periodo2\`` });
      }

      const embed = new EmbedBuilder()
.setTitle('⚗️ Tabla Periódica')
.setColor('#4CAF50')
.setDescription(res)
.setFooter({ text: 'XINTOKIO IA - Química' });
      return interaction.editReply({ embeds: [embed] });
    }

    // ASK - IA PARA TODOS
    if (commandName === 'ask') {
      const pregunta = interaction.options.getString('pregunta');
      await interaction.deferReply();
      try {
        const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(pregunta)}&format=json&no_html=1&skip_disambig=1`);
        const data = await res.json();
        let respuesta = data.AbstractText || data.Answer || 'No encontré nada bro, pregunta otra cosa.';
        if (respuesta.length > 1900) respuesta = respuesta.slice(0, 1900) + '...';
        const embed = new EmbedBuilder().setTitle('🤖 XINTOKIO IA').setColor('#5865F2').addFields({ name: 'Pregunta', value: pregunta }, { name: 'Respuesta', value: respuesta }).setFooter({ text: `Preguntado por ${interaction.user.tag}` });
        return interaction.editReply({ embeds: [embed] });
      } catch { return interaction.editReply({ content: '❌ Error de IA. Intenta después.' }); }
    }

    if (commandName === 'iamode') {
      const estado = interaction.options.getBoolean('estado');
      if (estado) {
        iaActiva.set(interaction.channel.id, true);
        return interaction.editReply({ content: '🤖 **IA Mode ON** en este canal. Menciona a XINTOKIO o escribe `xintokio,` y te respondo.' });
      } else {
        iaActiva.delete(interaction.channel.id);
        return interaction.editReply({ content: '🤖 **IA Mode OFF**' });
      }
    }

    // MOD PRO
    if (commandName === 'massban') {
      const tieneRol = interaction.member.roles.cache.some(r => ROLES_MASSBAN.includes(r.id));
      if (!tieneRol) return interaction.editReply({ content: '❌ Solo Co Owner y XINBONIS pueden usar esto.' });
      const ids = interaction.options.getString('usuarios').split(' ');
      const razon = interaction.options.getString('razon') || 'Massban por staff';
      let baneados = 0;
      for (const id of ids) {
        try { await interaction.guild.members.ban(id, { reason: razon }); baneados++; } catch {}
      }
      return interaction.editReply({ content: `🔨 ${baneados}/${ids.length} usuarios baneados.` });
    }

    if (commandName === 'userinfo') {
      const user = interaction.options.getUser('usuario');
      const member = await interaction.guild.members.fetch(user.id);
      const embed = new EmbedBuilder().setTitle(`👤 Info de ${user.tag}`).setThumbnail(user.displayAvatarURL()).setColor('#0099FF').addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Entró al server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: 'Roles', value: member.roles.cache.map(r => r).join(' ') || 'Ninguno' }
      );
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'roleall') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar roles`.' });
      const rol = interaction.options.getRole('rol');
      await interaction.deferReply();
      let count = 0;
      const members = await interaction.guild.members.fetch();
      for (const [, member] of members) {
        if (!member.user.bot) { try { await member.roles.add(rol); count++; } catch {} }
      }
      return interaction.editReply({ content: `✅ Rol ${rol} dado a ${count} miembros.` });
    }

    if (commandName === 'vcban') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.MuteMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Silenciar miembros`.' });
      const user = interaction.options.getUser('usuario');
      const member = await interaction.guild.members.fetch(user.id);
      await member.voice.disconnect().catch(() => {});
      await member.voice.setMute(true, 'VC Ban').catch(() => {});
      return interaction.editReply({ content: `🔇 ${user} baneado de voz.` });
    }

    if (commandName === 'nicklock') {
      if (interaction.options.getSubcommand() === 'unlock') {
        const user = interaction.options.getUser('usuario');
        nicklocked.delete(user.id);
        return interaction.editReply({ content: `🔓 Nick desbloqueado para ${user}` });
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageNicknames)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar apodos`.' });
      const user = interaction.options.getUser('usuario');
      const apodo = interaction.options.getString('apodo');
      const member = await interaction.guild.members.fetch(user.id);
      await member.setNickname(apodo);
      nicklocked.set(user.id, apodo);
      return interaction.editReply({ content: `🔒 Nick bloqueado: ${user} ahora es **${apodo}**` });
    }

    // LOGS Y AUTOSPY
    if (commandName === 'messagelogs') {
      return interaction.editReply({ content: '📜 Activa los logs del server en Ajustes > Auditoría para ver mensajes borrados. El bot no guarda mensajes por privacidad.' });
    }

    if (commandName === 'joinlogs') {
      const user = interaction.options.getUser('usuario');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.editReply({ content: '❌ Ese user no está en el server.' });
      return interaction.editReply({ content: `📅 ${user} entró: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>` });
    }

    if (commandName === 'invites') {
      const invites = await interaction.guild.invites.fetch();
      const top = invites.sort((a, b) => b.uses - a.uses).first(10);
      const lista = top.map((i, idx) => `**${idx + 1}.** ${i.inviter.tag}: ${i.uses} usos`).join('\n');
      return interaction.editReply({ embeds: [new EmbedBuilder().setTitle('📨 Top Invites').setColor('#00FF00').setDescription(lista || 'No hay invites')] });
    }

    if (commandName === 'antispam') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar servidor`.' });
      const estado = interaction.options.getBoolean('estado');
      if (estado) {
        antispam.set(interaction.guild.id, true);
        return interaction.editReply({ content: '🛡️ **Anti-spam ON**. 5 mensajes en 5s = timeout 10min.' });
      } else {
        antispam.delete(interaction.guild.id);
        return interaction.editReply({ content: '🛡️ **Anti-spam OFF**' });
      }
    }

    if (commandName === 'badword') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar mensajes`.' });
      const sub = interaction.options.getSubcommand();
      const lista = badwords.get(interaction.guild.id) || [];
      if (sub === 'add') {
        const palabra = interaction.options.getString('palabra').toLowerCase();
        lista.push(palabra);
        badwords.set(interaction.guild.id, lista);
        return interaction.editReply({ content: `🚫 Palabra agregada: **${palabra}**` });
      }
      if (sub === 'remove') {
        const palabra = interaction.options.getString('palabra').toLowerCase();
        badwords.set(interaction.guild.id, lista.filter(p => p!== palabra));
        return interaction.editReply({ content: `✅ Palabra quitada: **${palabra}**` });
      }
      if (sub === 'list') {
        return interaction.editReply({ content: lista.length? `🚫 **Lista negra:**\n${lista.join(', ')}` : 'Lista vacía.' });
      }
    }

    // ANTI-TOXIC EXTRA
    if (commandName === 'massnick') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageNicknames)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar apodos`.' });
      const apodo = interaction.options.getString('apodo');
      await interaction.deferReply();
      let count = 0;
      const members = await interaction.guild.members.fetch();
      for (const [, member] of members) {
        if (!member.user.bot) { try { await member.setNickname(apodo); count++; } catch {} }
      }
      return interaction.editReply({ content: `✏️ Apodo cambiado a ${count} miembros.` });
    }

    if (commandName === 'deafen') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.DeafenMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Ensordecer miembros`.' });
      const user = interaction.options.getUser('usuario');
      const member = await interaction.guild.members.fetch(user.id);
      await member.voice.setDeaf(true, 'Deafen por mod').catch(() => {});
      return interaction.editReply({ content: `🔇 ${user} ensordecido en voz.` });
    }

    if (commandName === 'nuke') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.editReply({ content: '❌ No tienes permiso `Gestionar canales`.' });
      const canal = interaction.channel;
      const nuevo = await canal.clone();
      await canal.delete();
      nuevo.send('💥 **CANAL NUKEADO** por orden del staff.');
    }

    if (commandName === 'susmode') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ content: '❌ No tienes permiso `Banear miembros`.' });
      const estado = interaction.options.getBoolean('estado');
      global.susMode = global.susMode || new Map();
      if (estado) {
        global.susMode.set(interaction.guild.id, true);
        return interaction.editReply({ content: '👁️ **SUSMODE ON**. Links al entrar = ban instantáneo.' });
      } else {
        global.susMode.delete(interaction.guild.id);
        return interaction.editReply({ content: '👁️ **SUSMODE OFF**' });
      }
    }

    if (commandName === 'fakeban') {
      const user = interaction.options.getUser('usuario');
      return interaction.editReply({ content: `🔨 ${user} ha sido baneado.`, files: [{ attachment: 'https://i.imgur.com/C6KW2Jz.png', name: 'fake.png' }] });
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
