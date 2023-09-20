const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const bdSchema = require(`../../Schemas.js/birthdaySchema`)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('next-birthday')
        .setDescription(`Show the time until your next birthday`),
    async execute(interaction) {
        const data = await bdSchema.findOne({ UserID: interaction.user.id})
        if (!data) {
            return interaction.reply({ content: `You haven't set your birthday yet. Use /set-birthday to set it.`, ephemeral: true });
        }
        //const { Year, Month, Day } = data;
        const today = new Date();
        const nextBirthday = new Date(today.getFullYear(), data.Month - 1, data.Day);

        if (today > nextBirthday) {
            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        const timeUntilBirthday = nextBirthday - today;
        const daysUntilBirthday = Math.ceil(timeUntilBirthday / (1000 * 60 * 60 * 24));
        const monthsUntilBirthday = Math.floor(daysUntilBirthday / 30);
        const remainingDays = daysUntilBirthday % 30;

        let h = '';

        if (monthsUntilBirthday > 0) {
            h += `${monthsUntilBirthday} Month(s)`;
            if (remainingDays > 0) {
                h += `, ${remainingDays} Day(s)`;
            }
        } else {
            h += `${daysUntilBirthday} Day(s)`;
        }

        const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle(`${interaction.user.username} | Next Birthday`)
            .setDescription(`**👉 Your next birthday is in \`${h}\`**`);

        await interaction.reply({ embeds: [embed] });
    },
};