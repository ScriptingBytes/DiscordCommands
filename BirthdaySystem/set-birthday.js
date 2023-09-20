const {SlashCommandBuilder,EmbedBuilder} = require('discord.js');
const bdSchema = require(`../../Schemas.js/birthdaySchema`)

function age1(birthYear, birthMonth, birthDay){
    const today=new Date();
    const birthdate=new Date(birthYear, birthMonth - 1, birthDay);
    let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
};

module.exports={
    data: new SlashCommandBuilder()
    .setName('set-birthday')
    .setDescription(`Set your birthdate.`)
    .addIntegerOption(option => option.setName('birth_day').setDescription(`The day.`).setRequired(true))
    .addIntegerOption(option => option.setName('birth_month').setDescription(`The month.`).setRequired(true))
    .addIntegerOption(option => option.setName('birth_year').setDescription(`The year.`).setRequired(true)),
    async execute(interaction) {
        const birthDay = interaction.options.getInteger('birth_day');
        const birthMonth = interaction.options.getInteger('birth_month');
        const birthYear = interaction.options.getInteger('birth_year');
        const age = age1(birthYear,birthMonth,birthDay)

        const data = await bdSchema.findOne({ UserID: interaction.user.id})

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
            await interaction.reply({ content: `You already have setup your birthday. Use /reset-birthday to reset it.` })
        }
    },
};