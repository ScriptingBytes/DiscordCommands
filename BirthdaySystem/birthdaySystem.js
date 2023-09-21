const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const bdSchema = require(`../../Schemas.js/birthdaySchema`)

function age1(birthYear, birthMonth, birthDay){
    const today = new Date();
    const birthdate = new Date(birthYear, birthMonth - 1, birthDay);
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age;
};

module.exports = {
    data: new SlashCommandBuilder()
    .setName('birthday-system')
    .setDescription(`A birthday system for you to setup a birthday.`)
    .addSubcommand(command => command.setName(`set`).setDescription(`Setup your birthdate.`).addIntegerOption(option => option.setName('birth_day').setDescription(`The day.`).setRequired(true)).addIntegerOption(option => option.setName('birth_month').setDescription(`The month.`).setRequired(true)).addIntegerOption(option => option.setName('birth_year').setDescription(`The year.`).setRequired(true)))
    .addSubcommand(command => command.setName(`display`).setDescription(`See when your or another user's next birthday is.`).addUserOption(option => option.setName(`user`).setDescription(`The user you want to specify.`).setRequired(false)))
    .addSubcommand(command => command.setName(`reset`).setDescription(`Reset your birthdate.`)),
    async execute(interaction) {
        const userbd = interaction.options.getUser('user') || interaction.user.id
        const sub = interaction.options.getSubcommand()
        const data = await bdSchema.findOne({ UserID: userbd.id})

        switch (sub) {
            case 'set':
                const birthDay = interaction.options.getInteger('birth_day');
                const birthMonth = interaction.options.getInteger('birth_month');
                const birthYear = interaction.options.getInteger('birth_year');
                const age = age1(birthYear,birthMonth,birthDay)

                if (!data) {
                    await bdSchema.create({
                        UserID: interaction.user.id,
                        Age: age,
                        Year: birthYear,
                        Month: birthMonth,
                        Day: birthDay
                    })

                    const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setTitle(`${interaction.user.username} | Birthday`)
                    .setDescription(`**👉 Successfully setuped your birth date (\`${birthMonth}/${birthDay}/${birthYear}\`)[\`${age}\` Years old.]**`)
                    await interaction.reply({embeds: [embed]});
                } else {
                    await interaction.reply({ content: `You already have setup your birthday. Use /reset-birthday to reset it.`, ephemeral: true })
                }
            break;

            case 'display':
                if (!data) {
                    return interaction.reply({ content: `The mentioned user or you haven't setup their birthday yet. Have them or you use /set-birthday to set it.`, ephemeral: true });
                } else {
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
                        .setTitle(`${user.username} | Next Birthday`)
                        .setDescription(`**👉 Your next birthday is in \`${h}\`**`);
            
                    await interaction.reply({ embeds: [embed] });
                }
            break;

            case 'reset':
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
        }
    }
}