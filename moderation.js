// XINTOKIO BOT - PACK MODERACIÓN COMPLETO
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, REST, Routes, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

// DEFINIR TODOS LOS COMANDOS
const commands = [
    new SlashCommandBuilder()
       .setName('ban')
       .setDescription('Banea a un usuario del servidor')
       .addUserOption(option => option.setName('usuario').setDescription('Usuario a banear').setRequired(true))
       .addStringOption(option => option.setName('razon').setDescription('Razón del ban').setRequired(false))
       .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
       .setDMPermission(false),

    new SlashCommandBuilder()
       .setName('kick')
       .setDescription('Expulsa a un usuario')
       .addUserOption(option => option.setName('usuario').setDescription('Usuario a expulsar').setRequired(true))
       .addStringOption(option => option.setName('razon').setDescription('Razón del kick').setRequired(false))
       .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
       .setDMPermission(false),

    new SlashCommandBuilder()
       .setName('timeout')
       .setDescription('Mutea a un usuario con timeout')
       .addUserOption(option => option.setName('usuario').setDescription('Usuario a mutear').setRequired(true))
       .addIntegerOption(option => option.setName('minutos').setDescription('Minutos de mute 1-40320').setRequired(true).setMaxValue(40320).setMinValue(1))
       .addStringOption(option => option.setName('razon').setDescription('Razón').setRequired(false))
       .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
       .setDMPermission(false),

    new SlashCommandBuilder()
       .setName('unban')
       .setDescription('Desbanea a un usuario por ID')
       .addStringOption(option => option.setName('userid').setDescription('ID del usuario').setRequired(true))
       .addStringOption(option => option.setName('razon').setDescription('Razón').setRequired(false))
       .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
       .setDMPermission(false),

    new SlashCommandBuilder()
       .setName('clear')
       .setDescription('Borra mensajes del canal')
       .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad 1-100').setRequired(true).setMaxValue(100).setMinValue(1))
       .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
       .setDMPermission(false),

    new SlashCommandBuilder()
       .setName('warn')
       .setDescription('Advierte a un usuario')
       .addUserOption(option => option.setName('usuario').setDescription('Usuario').setRequired(true))
       .addStringOption(option => option.setName('razon').setDescription('Razón').setRequired(true))
       .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
       .setDMPermission(false),

    new SlashCommandBuilder()
       .setName('lock')
       .setDescription('Bloquea el canal actual')
       .addStringOption(option => option.setName('razon').setDescription('Razón del lock').setRequired(false))
       .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
       .setDMPermission(false),

    new SlashCommandBuilder()
       .setName('unlock')
       .setDescription('Desbloquea el canal actual')
       .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
       .setDMPermission(false),

    new SlashCommandBuilder()
       .setName('slowmode')
       .setDescription('Activa modo lento en el canal')
       .addIntegerOption(option => option.setName('segundos').setDescription('Segundos 0-21600. 0 para quitar').setRequired(true).setMaxValue(21600).setMinValue(0))
       .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
       .setDMPermission(false),

    new SlashCommandBuilder()
       .setName('decir')
       .setDescription('Haz que el bot diga algo')
       .addStringOption(option => option.setName('mensaje').setDescription('Lo que dirá el bot').setRequired(true))
       .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
       .setDMPermission(false),
].map(command => command.toJSON());

// REGISTRAR COMANDOS AL INICIAR
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
    console.log(`✅ XINTOKIO online como ${client.user.tag}`);
    client.user.setActivity('moderando el server', { type: ActivityType.Watching });
    
    try {
        console.log('Registrando comandos slash...');
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log(`✅ ${commands.length} comandos registrados correctamente`);
    } catch (error) {
        console.error('Error registrando comandos:', error);
    }
});

// MANEJO DE COMANDOS
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    // Defer para comandos que tardan
    if (['ban', 'kick', 'clear'].includes(commandName)) {
        await interaction.deferReply();
    }

    try {
        const usuario = interaction.options.getUser('usuario');
        const miembro = interaction.options.getMember('usuario');
        const razon = interaction.options.getString('razon') || 'Sin razón';

        // BAN
        if (commandName === 'ban') {
            if (!miembro) return interaction.editReply({ content: '❌ Usuario no encontrado en el servidor', ephemeral: true });
            if (miembro.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.editReply({ content: '❌ No puedes banear a alguien con rol igual o mayor', ephemeral: true });
            }
            if (!miembro.bannable) {
                return interaction.editReply({ content: '❌ No puedo banear a este usuario. Mi rol está muy abajo', ephemeral: true });
            }
            await miembro.ban({ reason: razon });
            const embed = new EmbedBuilder()
               .setTitle('🔨 Usuario baneado')
               .setDescription(`**Usuario:** ${usuario.tag}\n**Razón:** ${razon}\n**Mod:** ${interaction.user}`)
               .setColor('Red')
               .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }

        // KICK
        else if (commandName === 'kick') {
            if (!miembro) return interaction.editReply({ content: '❌ Usuario no encontrado', ephemeral: true });
            if (miembro.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.editReply({ content: '❌ No puedes kickear a alguien con rol igual o mayor', ephemeral: true });
            }
            if (!miembro.kickable) {
                return interaction.editReply({ content: '❌ No puedo kickear a este usuario. Mi rol está muy abajo', ephemeral: true });
            }
            await miembro.kick(razon);
            await interaction.editReply(`👢 ${usuario.tag} expulsado. Razón: ${razon}`);
        }

        // TIMEOUT
        else if (commandName === 'timeout') {
            const minutos = interaction.options.getInteger('minutos');
            if (!miembro) return interaction.reply({ content: '❌ Usuario no encontrado', ephemeral: true });
            if (!miembro.moderatable) {
                return interaction.reply({ content: '❌ No puedo mutear a este usuario. Mi rol está muy abajo', ephemeral: true });
            }
            const duracion = minutos * 60 * 1000;
            await miembro.timeout(duracion, razon);
            await interaction.reply(`🔇 ${usuario.tag} muteado por ${minutos} min. Razón: ${razon}`);
        }

        // UNBAN
        else if (commandName === 'unban') {
            const userId = interaction.options.getString('userid');
            await interaction.guild.members.unban(userId, razon);
            await interaction.reply(`✅ Usuario con ID ${userId} desbaneado. Razón: ${razon}`);
        }

        // CLEAR
        else if (commandName === 'clear') {
            const cantidad = interaction.options.getInteger('cantidad');
            const deleted = await interaction.channel.bulkDelete(cantidad, true);
            await interaction.editReply({ content: `🧹 Borrados ${deleted.size} mensajes`, ephemeral: true });
        }

        // WARN
        else if (commandName === 'warn') {
            const embed = new EmbedBuilder()
               .setTitle('⚠️ Advertencia')
               .setDescription(`${usuario} has recibido una advertencia`)
               .addFields(
                    { name: 'Razón', value: razon, inline: false },
                    { name: 'Moderador', value: `${interaction.user}`, inline: true }
               )
               .setColor('Orange')
               .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            try { 
                await usuario.send(`Fuiste advertido en **${interaction.guild.name}**\n**Razón:** ${razon}`); 
            } catch (e) {
                await interaction.followup.send({ content: 'No pude mandarle DM al usuario', ephemeral: true });
            }
        }

        // LOCK
        else if (commandName === 'lock') {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
            await interaction.reply(`🔒 Canal bloqueado. Razón: ${razon}`);
        }

        // UNLOCK
        else if (commandName === 'unlock') {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
            await interaction.reply('🔓 Canal desbloqueado');
        }

        // SLOWMODE
        else if (commandName === 'slowmode') {
            const segundos = interaction.options.getInteger('segundos');
            await interaction.channel.setRateLimitPerUser(segundos);
            if (segundos === 0) {
                await interaction.reply('⏱️ Modo lento desactivado');
            } else {
                await interaction.reply(`⏱️ Modo lento activado: ${segundos}s`);
            }
        }

        // DECIR
        else if (commandName === 'decir') {
            const mensaje = interaction.options.getString('mensaje');
            await interaction.reply({ content: '✅ Mensaje enviado', ephemeral: true });
            await interaction.channel.send(mensaje);
        }

    } catch (error) {
        console.error(`Error en comando ${commandName}:`, error);
        const errorMsg = { content: '❌ Ocurrió un error ejecutando el comando', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
            await interaction.followup.send(errorMsg);
        } else {
            await interaction.reply(errorMsg);
        }
    }
});

// MANEJO DE ERRORES PARA QUE NO SE CAIGA EN RENDER
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.TOKEN);
