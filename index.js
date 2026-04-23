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
        new SlashCommandBuilder().setName('abrazar').setDescription('Abraza a alguien').addUserOption(o => o.setName('usuario').setDescription('A quién abrazar').setRequired(true))
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
        } catch { await interaction.reply({ content: 'No tengo permisos o mi rol está muy abajo', ephemeral: true }); }
    }
    if (commandName === 'rol') {
        const user = interaction.options.getUser('usuario');
        const role = interaction.options.getRole('rol');
        const member = await interaction.guild.members.fetch(user.id);
        try {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                await interaction.reply(`✅ Le quité ${role.name} a ${user.tag}`);
            } else {
                await member.roles.add(role);
                await interaction.reply(`✅ Le di ${role.name} a ${user.tag}`);
            }
        } catch { await interaction.reply({ content: 'Mi rol debe estar arriba del que quieres dar', ephemeral: true }); }
    }
    if (commandName === 'decir') {
        const mensaje = interaction.options.getString('mensaje');
        const canal = interaction.options.getChannel('canal') || interaction.channel;
        await canal.send(mensaje);
        await interaction.reply({ content: 'Enviado', ephemeral: true });
    }
    if (commandName === 'abrazar') {
        const user = interaction.options.getUser('usuario');
        const gifs = ['https://media.tenor.com/No3Q-VBd8B4AAAAC/anime-hug.gif','https://media.tenor.com/G9QcCeqzUeMAAAAC/anime-hug.gif'];
        const embed = new EmbedBuilder().setDescription(`**${interaction.user.username}** abrazó a **${user.username}** 🥺`).setImage(gifs[Math.floor(Math.random()*gifs.length)]).setColor('#FFB6C1');
        await interaction.reply({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
