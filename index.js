const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', async () => {
    console.log(`XINTOKIO online como ${client.user.tag}`);
    const commands = [
        new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos'),
        new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        new SlashCommandBuilder().setName('kick').setDescription('Expulsa a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        new SlashCommandBuilder().setName('rol').setDescription('Da o quita un rol').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        new SlashCommandBuilder().setName('decir').setDescription('XINTOKIO envía un mensaje').addStringOption(o => o.setName('mensaje').setDescription('Mensaje').setRequired(true)).addChannelOption(o => o.setName('canal').setDescription('Canal').setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        new SlashCommandBuilder().setName('abrazar').setDescription('Abraza a alguien').addUserOption(o => o.setName('usuario').setDescription('A quién abrazar').setRequired(true)),
        new SlashCommandBuilder().setName('mute').setDescription('Silencia a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('minutos').setDescription('Minutos de mute').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        new SlashCommandBuilder().setName('unmute').setDescription('Quita el mute a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        new SlashCommandBuilder().setName('warn').setDescription('Advierte a un usuario').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        new SlashCommandBuilder().setName('clear').setDescription('Borra mensajes').addIntegerOption(o => o.setName('cantidad').setDescription('1-100 mensajes').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    ].map(command => command.toJSON());
    await client.application.commands.set(commands);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'help') {
        const embed = new EmbedBuilder().setTitle('🌸 Comandos de XINTOKIO').setColor('#FF69B4').addFields(
            { name: '/ban @usuario', value: 'Banea usuarios' },
            { name: '/kick @usuario', value: 'Expulsa usuarios' },
            { name: '/mute @usuario minutos', value: 'Silencia con timeout' },
            { name: '/unmute @usuario', value: 'Quita el timeout' },
            { name: '/warn @usuario razón', value: 'Advierte a un usuario' },
            { name: '/clear cantidad', value: 'Borra mensajes 1-100' },
            { name: '/rol @usuario @rol', value: 'Da/quita roles' },
            { name: '/decir mensaje', value: 'El bot habla por ti' },
            { name: '/abrazar @usuario', value: 'Rol con gifs' }
        );
        await interaction.reply({ embeds: [embed] });
    }
    if (commandName === 'ban') {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'Sin razón';
        try {
            await interaction.guild.members.ban(user, { reason });
            await interaction.reply(`🔨 ${user.tag} fue baneado. Razón: ${reason}`);
        } catch { await interaction.reply({ content: 'No tengo permisos o mi rol está muy abajo', ephemeral: true }); }
    }
    if (commandName === 'kick') {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'Sin razón';
        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.kick(reason);
            await interaction.reply(`👢 ${user.tag} fue expulsado. Razón: ${reason}`);
        } catch { await
