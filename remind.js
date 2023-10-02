const { SlashCommandBuilder, EmbedBuilder } = require(`discord.js`)

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`remind`)
    .setDescription(`A reminder/timer system to remind you to do a certain task.`)
    .addStringOption(opt => opt.setName(`description`).setDescription(`The task you want to be reminded of.`).setRequired(true))
    .addStringOption(opt => opt.setName(`time`).setDescription(`The time in minutes`)
    .addChoices(
        { name: '60 Secs', value: '60'},
        { name: '2 Minutes', value: '120'},
        { name: '5 Minutes', value: '300'},
        { name: '10 Minutes', value: '600'},
        { name: '15 Minutes', value: '900'},
        { name: '20 Minutes', value: '1200'},
        { name: '30 Minutes', value: '1800'},
        { name: '45 Minutes', value: '2700'},
        { name: '1 Hour', value: '3600'},
        { name: '2 Hours', value: '7200'},
        { name: '3 Hours', value: '10800'},
        { name: '5 Hours', value: '18000'},
        { name: '10 Hours', value: '36000'}
    ).setRequired(true)),
    async execute (interaction) {
        const desc = interaction.options.getString(`description`)
        const time = interaction.options.getString(`time`)
        const channel = interaction.channel

        const embed = new EmbedBuilder()
        .setColor(`Orange`)
        .setTitle(`A Friendly Reminder`)
        .setDescription(`I've setup a reminder for the following:\n\`\`\`TIME: ${time} (Seconds) | ${time*1000} (Milliseconds)\nTASK/DESCRIPTION: ${desc}\`\`\``)

        const remindEmbed = new EmbedBuilder()
        .setColor(`Orange`)
        .setTitle(`A Friendly Reminder`)
        .setDescription(`Your remind timer is now up. Time for you to do: **${desc}**`)

        await interaction.reply({ embeds: [embed]})

        setTimeout(async () => {
            await channel.send({ content: `<@${interaction.user.id}>`, embeds: [remindEmbed]})
        }, time*1000) 

    }
}