// ========================================
// 1. CONFIGURACIÓN E IMPORTS
// ========================================
require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');
const express = require('express');

// ========================================
// 2. CONSTANTES Y CONFIG
// ========================================
const OWNER_ID = '1433375850996301882'; // Tu ID de Discord
const PORT = process.env.PORT || 3000;

// ========================================
// 3. SERVIDOR WEB PARA RENDER 24/7
// ========================================
const app = express();
app.get('/', (req, res) => res.send('✅ XINTOKIO ONLINE 24/7'));
app.listen(PORT, () => console.log(`🌐 Servidor web en puerto ${PORT}`));

// ========================================
// 4. CLIENTE DE DISCORD
// ========================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ========================================
// 5. BASE DE DATOS EN MEMORIA
// ========================================
const db = {
  warns: new Map(),
  modStats: new Map(),
  caseLogs: new Map(),
  userNotes: new Map(),
  tempRoles: new Map(),
  bannedUsers: new Map(),
  linkedAlts: new Map()
};

// ========================================
// 6. EVENTOS DEL BOT
// ========================================
client.once('ready', () => {
  console.log(`✅ XINTOKIO online como ${client.user.tag}`);
  console.log(`✅ Bot en ${client.guilds.cache.size} servidores`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  // ==================
  // COMANDO: /PING
  // ==================
  if (interaction.commandName === 'ping') {
    const sent = await interaction.reply({
      content: 'Calculando ping...',
      fetchReply: true
    });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! ${latency}ms | API: ${Math.round(client.ws.ping)}ms`);
  }

  // ==================
  // COMANDO: /PANELADMIN
  // ==================
  if (interaction.commandName === 'paneladmin') {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Solo el owner puede usar este comando.',
        flags: MessageFlags.Ephemeral
      });
    }
    await interaction.reply({
      content: `👑 **Panel Admin**\nServidores: ${client.guilds.cache.size}`,
      flags: MessageFlags.Ephemeral
    });
  }

  // AQUÍ PEGAS TUS OTROS 35 COMANDOS
});

// ========================================
// 7. LOGIN
// ========================================
client.login(process.env.TOKEN); 
