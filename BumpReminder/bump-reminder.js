const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const brSchema = require('../../Schemas.js/bumpSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('bump-reminder')
    .setDescription("Bump Reminder System Commands")
    .addSubcommand(sc => sc
        .setName("setup")
        .setDescription("Setup the Bump Reminder system")
        .addRoleOption(o => o.setName("role").setDescription("The role to ping when the server is ready to be bumped").setRequired(true))
        .addStringOption(o => o.setName("description").setDescription("The description of the bump reminder message")))
    .addSubcommand(sc => sc
        .setName("disable")
        .setDescription("Disable the Bump Reminder system"))
    .addSubcommand(sc => sc
        .setName("edit")
        .setDescription("Edit the Bump Reminder system")
        .addRoleOption(o => o.setName("role").setDescription("The role to ping when the server is ready to be bumped").setRequired(false))
        .addStringOption(o => o.setName("description").setDescription("The description of the bump reminder message"))),

    async execute (interaction, client) {
        const { guild, user, member, options } = interaction;
        if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) return await interaction.reply({ content: `<:Denied:1125943015878443089> You do not have permission to use that command.`, ephemeral: true })
        const sub = options.getSubcommand();
        const data = await brSchema.findOne({ guild: guild.id });

        const role = options.getRole('role');
        const desc = options.getString('description');
        if (sub === 'setup') {
            if (!data) {
                await brSchema.create({
                    guild: guild.id,
                    description: desc ?? "The server is ready to be bumped!",
                    pingRole: role.id
                })
            } else {
                await brSchema.findOneAndUpdate({guild:guild.id}, {
                    description: desc ?? "The server is ready to be bumped!",
                    pingRole: role.id
                })
            }

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("Bump Reminder")
            .setDescription(desc ?? "The server is ready to be bumped!")

            await interaction.reply({ content: `<@&${role.id}>`, embeds: [embed], ephemeral: true })
        } else if (sub === 'disable') {
            if (!data) return await interaction.reply({ content: "This server does not have bump reminders", ephemeral: true })

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("Bump Reminder")
            .setDescription("The bump reminder system was disabled")

            await brSchema.findOneAndDelete({guild:guild.id})
            await interaction.reply({ embeds: [embed], ephemeral: true })
        } else if (sub === 'edit') {
            if (!data) return await interaction.reply({ content: "This server does not have bump reminders", ephemeral: true })
            
            if (!role && !desc) return await interaction.reply({ content: "You must edit one of the two options", ephemeral: true })
            if (role) {
                if (desc) {
                    await brSchema.findOneAndUpdate({guild:guild.id}, {
                        description: desc,
                        pingRole: role.id
                    })
                } else {
                    await brSchema.findOneAndUpdate({guild:guild.id}, {
                        pingRole: role.id
                    })
                }
            } else if (desc) {
                await brSchema.findOneAndUpdate({guild:guild.id}, {
                    description: desc,
                })
            }

            const exRole = role ? role.id : data.pingRole;
            const exDesc = desc ?? data.description;
            
            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setDescription(exDesc)

            await interaction.reply({ content: `<@&${exRole}>`, embeds: [embed], ephemeral: true })
        }
    }
}