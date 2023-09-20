const {SlashCommandBuilder,EmbedBuilder} = require('discord.js');
const bdSchema = require(`../../Schemas.js/birthdaySchema`)

module.exports={
    data: new SlashCommandBuilder()
    .setName('reset-birthday')
    .setDescription(`reset your birthdate information.`),
    async execute(interaction) {
        const data = await bdSchema.findOne({ UserID: interaction.user.id})
        if (!data) {
            return interaction.reply({ content: `You haven't set your birthday yet. Use /set-birthday to set it.`, ephemeral: true });
        } else {
            await bdSchema.deleteMany({ UserID: interaction.user.id})

            const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle(`${interaction.user.username} | Birthday Reset`)
            .setDescription(`**👉 Your birthday information has been reset.**`)
            await interaction.reply({embeds: [embed]});
        };
    },
};