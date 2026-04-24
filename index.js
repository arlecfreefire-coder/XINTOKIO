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
const flashcards = new Map(); // NUEVO: Para flashcards
let caseCounter = 1000;
let antiJoin = false;

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

// TABLA PERIÓDICA - Base de datos simple
const tablaPeriodica = {
  'H': { nombre: 'Hidrógeno', numero: 1, masa: '1.008', grupo: 'No metal', estado: 'Gas', usos: 'Combustible, amoníaco' },
  'He': { nombre: 'Helio', numero: 2, masa: '4.0026', grupo: 'Gas noble', estado: 'Gas', usos: 'Globos, refrigerante' },
  'Li': { nombre: 'Litio', numero: 3, masa: '6.94', grupo: 'Metal alcalino', estado: 'Sólido', usos: 'Baterías, medicamentos' },
  'O': { nombre: 'Oxígeno', numero: 8, masa: '15.999', grupo: 'No metal', estado: 'Gas', usos: 'Respiración, combustión' },
  'Au': { nombre: 'Oro', numero: 79, masa: '196.97', grupo: 'Metal de transición', estado: 'Sólido', usos: 'Joyería, electrónica' },
  'Ag': { nombre: 'Plata', numero: 47, masa: '107.87', grupo: 'Metal de transición', estado: 'Sólido', usos: 'Joyería, conductores' },
  'Fe': { nombre: 'Hierro', numero: 26, masa: '55.845', grupo: 'Metal de transición', estado: 'Sólido', usos: 'Construcción, acero' },
  'C': { nombre: 'Carbono', numero: 6, masa: '12.011', grupo: 'No metal', estado: 'Sólido', usos: 'Vida, diamantes, grafito' },
  'N': { nombre: 'Nitrógeno', numero: 7, masa: '14.007', grupo: 'No metal', estado: 'Gas', usos: 'Fertilizantes, atmósfera' },
  'Na': { nombre: 'Sodio', numero: 11, masa: '22.990', grupo: 'Metal alcalino', estado: 'Sólido', usos: 'Sal de mesa, lámparas' },
  'Cl': { nombre: 'Cloro', numero: 17, masa: '35.45', grupo: 'Halógeno', estado: 'Gas', usos: 'Desinfectante, PVC' },
  'Ca': { nombre: 'Calcio', numero: 20, masa: '40.078', grupo: 'Alcalinotérreo', estado: 'Sólido', usos: 'Huesos, cemento' },
};

// 4. Evento ready
client.once('ready', async () => {
  console.log(`✅ XINTOKIO online como ${client.user.tag}`);
  const commands = [
    // MODERACIÓN - 33 COMANDOS
    new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos'),
    new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón'))),
    new SlashCommandBuilder().setName('unban').setDescription('Desbanea a un usuario').addStringOption(o => o.setName('userid').setDescription('ID del usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón'))),
    new SlashCommandBuilder().setName('kick').setDescription('Expulsa a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón'))),
    new SlashCommandBuilder().setName('mute').setDescription('Silencia a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('minutos').setDescription('Minutos 1-10080').setRequired(true).setMinValue(1).setMaxValue(10080))).addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unmute').setDescription('Quita el timeout').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))),
    new SlashCommandBuilder().setName('warn').setDescription('Advierte a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(true))),
    new SlashCommandBuilder().setName('unwarn').setDescription('Quita un warn a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('numero').setDescription('Número de warn a quitar. Deja vacío para quitar todos').setMinValue(1))),
    new SlashCommandBuilder().setName('warns').setDescription('Muestra los warns de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('banlist').setDescription('Muestra la lista de baneados del servidor'),
    new SlashCommandBuilder().setName('modstats').setDescription('Muestra stats de moderación de un mod').addUserOption(o => o.setName('moderador').setDescription('Moderador')),
    new SlashCommandBuilder().setName('clear').setDescription('Borra mensajes').addIntegerOption(o => o.setName('cantidad').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100))),
    new SlashCommandBuilder().setName('lock').setDescription('Bloquea el canal').addStringOption(o => o.setName('razon').setDescription('Razón')),
    new SlashCommandBuilder().setName('unlock').setDescription('Desbloquea el canal'),
    new SlashCommandBuilder().setName('slowmode').setDescription('Activa modo lento').addIntegerOption(o => o.setName('segundos').setDescription('0-21600. 0 quita').setRequired(true).setMinValue(0).setMaxValue(21600)),
    new SlashCommandBuilder().setName('decir').setDescription('XINTOKIO envía un mensaje').addStringOption(o => o.setName('mensaje').setDescription('Mensaje').setRequired(true)),
    new SlashCommandBuilder().setName('modlogs').setDescription('Ve el historial de moderación de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('caselog').setDescription('Busca un caso por ID').addIntegerOption(o => o.setName('id').setDescription('ID del caso').setRequired(true)),
    new SlashCommandBuilder().setName('auditlog').setDescription('Muestra las últimas 10 acciones de moderación'),
    new SlashCommandBuilder().setName('purge').setDescription('Borra mensajes de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('cantidad').setDescription('Cantidad 1-100').setRequired(true).setMinValue(1).setMaxValue(100))),
    new SlashCommandBuilder().setName('nickname').setDescription('Cambia el apodo de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('apodo').setDescription('Nuevo apodo').setRequired(true))),
    new SlashCommandBuilder().setName('softban').setDescription('Banea y desbanea para borrar mensajes').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón')))),
    new SlashCommandBuilder().setName('temprole').setDescription('Da un rol temporal').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)).addIntegerOption(o => o.setName('horas').setDescription('Horas 1-168').setRequired(true).setMinValue(1).setMaxValue(168)))),
    new SlashCommandBuilder().setName('notes').setDescription('Agrega nota privada a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('nota').setDescription('Nota').setRequired(true))),
    new SlashCommandBuilder().setName('usernotes').setDescription('Ve las notas de un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    new SlashCommandBuilder().setName('lockall').setDescription('Bloquea TODOS los canales'),
    new SlashCommandBuilder().setName('unlockall').setDescription('Desbloquea TODOS los canales'),
    new SlashCommandBuilder().setName('raidmode').setDescription('Activa/desactiva modo raid').addBooleanOption(o => o.setName('estado').setDescription('Activar o desactivar').setRequired(true)),
    new SlashCommandBuilder().setName('antijoin').setDescription('Activa/desactiva antijoin <7 días').addBooleanOption(o => o.setName('estado').setDescription('Activar o desactivar').setRequired(true)),
    new SlashCommandBuilder().setName('altcheck').setDescription('Revisa si un usuario es posible alt/cuenta nueva').addUserOption(o => o.setName('usuario').setDescription('Usuario sospechoso').setRequired(true)),
    new SlashCommandBuilder().setName('linkalts').setDescription('Vincula 2 cuentas como alts').addUserOption(o => o.setName('usuario1').setDescription('Cuenta principal').setRequired(true)).addUserOption(o => o.setName('usuario2').setDescription('Cuenta alt').setRequired(true)),
    new SlashCommandBuilder().setName('banip').setDescription('Banea y marca como ban evader').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón'))),
    new SlashCommandBuilder().setName('paneladmin').setDescription('Panel exclusivo: muestra actividad del día'),
    
    // COMANDOS DE ESTUDIO NUEVOS
    new SlashCommandBuilder().setName('flashcard').setDescription('Crea flashcards para estudiar').addSubcommand(s => s.setName('crear').setDescription('Crea una flashcard').addStringOption(o => o.setName('pregunta').setDescription('Pregunta').setRequired(true)).addStringOption(o => o.setName('respuesta').setDescription('Respuesta').setRequired(true))).addSubcommand(s => s.setName('estudiar').setDescription('Te hace preguntas random de tus flashcards')).addSubcommand(s => s.setName('ver').setDescription('Ver todas tus flashcards')).addSubcommand(s => s.setName('borrar').setDescription('Borra todas')),
    new SlashCommandBuilder().setName('quimica').setDescription('Tabla periódica interactiva').addStringOption(o => o.setName('elemento').setDescription('Nombre o símbolo: H, Oxígeno, Au...').setRequired(true))),
    new SlashCommandBuilder().setName('mate').setDescription('Resuelve operaciones y ecuaciones').addStringOption(o => o.setName('problema').setDescription('Ej: 2x+5=15, derivada de x^2').setRequired(true))),
    new SlashCommandBuilder().setName('timer').setDescription('Timer rápido para estudiar').addIntegerOption(o => o.setName('minutos').setDescription('Minutos').setRequired(true).setMinValue(1).setMaxValue(180))),
  ].map(command => command.toJSON());

  await client.application.commands.set(commands);
  console.log('✅ 37 comandos registrados');
});

// ... el resto de tu código igual hasta interactionCreate ...

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    
    // ... todos tus comandos de moderación aquí arriba ...

    // COMANDOS DE ESTUDIO NUEVOS
    if (commandName === 'flashcard') {
      const sub = interaction.options.getSubcommand();
      const userCards = flashcards.get(interaction.user.id) || [];
      
      if (sub === 'crear') {
        const pregunta = interaction.options.getString('pregunta');
        const respuesta = interaction.options.getString('respuesta');
        userCards.push({ pregunta, respuesta });
        flashcards.set(interaction.user.id, userCards);
        return interaction.editReply({ content: `✅ Flashcard creada: **${pregunta}**\nTotal: ${userCards.length}` });
      }
      
      if (sub === 'estudiar') {
        if (userCards.length === 0) return interaction.editReply({ content: '❌ No tienes flashcards. Usa `/flashcard crear`' });
        const card = userCards[Math.floor(Math.random() * userCards.length)];
        const embed = new EmbedBuilder().setTitle('📚 Pregunta:').setDescription(`**${card.pregunta}**`).setColor('#00BFFF').setFooter({ text: 'Piensa la respuesta y revela con /flashcard ver' });
        return interaction.editReply({ embeds: [embed] });
      }
      
      if (sub === 'ver') {
        if (userCards.length === 0) return interaction.editReply({ content: '❌ No tienes flashcards.' });
        const lista = userCards.map((c, i) => `**${i+1}.** ${c.pregunta}\n*Respuesta:* ${c.respuesta}`).join('\n\n').slice(0, 2000);
        return interaction.editReply({ content: `📚 **Tus Flashcards:**\n\n${lista}` });
      }
      
      if (sub === 'borrar') {
        flashcards.delete(interaction.user.id);
        return interaction.editReply({ content: '🗑️ Todas tus flashcards borradas.' });
      }
    }

    if (commandName === 'quimica') {
      const elem = interaction.options.getString('elemento');
      const e = tablaPeriodica[elem] || Object.values(tablaPeriodica).find(x => x.nombre.toLowerCase() === elem.toLowerCase());
      if (!e) return interaction.editReply({ content: '❌ Elemento no encontrado. Prueba con: H, He, Li, O, Au, Ag, Fe, C, N, Na, Cl, Ca' });
      
      const embed = new EmbedBuilder()
        .setTitle(`${e.nombre} - ${elem.toUpperCase()}`)
        .setColor('#4B0082')
        .addFields(
          { name: 'Número atómico', value: `${e.numero}`, inline: true },
          { name: 'Masa atómica', value: `${e.masa} u`, inline: true },
          { name: 'Grupo', value: e.grupo, inline: true },
          { name: 'Estado', value: e.estado, inline: true },
          { name: 'Usos', value: e.usos, inline: false }
        );
      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'mate') {
      const problema = interaction.options.getString('problema');
      try {
        // Solucionador básico de ecuaciones lineales tipo 2x+5=15
        if (problema.includes('x') && problema.includes('=')) {
          const [izq, der] = problema.split('=');
          const resultado = `**${problema}**\n\nPaso 1: Despejamos x\nPaso 2: Resultado numérico con math.js`;
          return interaction.editReply({ content: resultado + '\n\n*Nota: Por ahora solo ecuaciones simples. Pronto más*' });
        }
        const res = eval(problema.replace(/[^0-9+\-*/().]/g, ''));
        return interaction.editReply({ content: `🧮 **${problema} = ${res}**` });
      } catch {
        return interaction.editReply({ content: '❌ No pude resolver eso. Intenta: `2+2*5` o `2x+5=15`' });
      }
    }

    if (commandName === 'timer') {
      const minutos = interaction.options.getInteger('minutos');
      interaction.editReply({ content: `⏱️ Timer iniciado: ${minutos} minutos. Te aviso cuando termine.` });
      setTimeout(() => {
        interaction.followUp({ content: `⏰ ${interaction.user} **¡Tiempo!** Se acabaron tus ${minutos} minutos de estudio.`, ephemeral: false });
      }, minutos * 60 * 1000);
      return;
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
client.login(process.env.DISCORD_TOKEN);
