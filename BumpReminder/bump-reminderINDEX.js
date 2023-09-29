// Bump Reminder
// THIS GOES INTO YOUR INDEX.JS FILE
const brSchema = require('./Schemas.js/bumpSchema.js');
client.on(Events.MessageCreate, async (message) => {
    const user = message.author;
    if (!user.bot || user.id !== "302050872383242240") return;

    const embeds = message.embeds;
    const msgEmbeds = embeds.length
    const msgDesc = embeds[0]?.description?.toString();

    const data = await brSchema.findOne({ guild: message.guild.id });
    
    if (msgEmbeds >= 1 && msgDesc.includes("Bump done! :thumbsup:")) {
        await message.react('⏱')

        let currentTime = new Date().getTime();
        let timeIn2Hours = new Date(currentTime + 2 * 60 * 60 * 1000);

        const bumpedEmbed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("Bump Reminder")
        .setDescription(`Bumped Successfully!\n\nI'll remind you to bump again <t:${Math.floor(timeIn2Hours/1000)}:R>`)

        message.channel.send({ embeds: [bumpedEmbed] })

        var hrs2 = 7200000;

        setTimeout(async () => {
            const date = new Date().getTime()
            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("Bump Reminder")
            .setDescription(data.description ?? `Bump Ready!\n\nThis server has been ready to bump since: <t:${Math.floor(date/1000)}:R>`)
            message.channel.send({ content: `<@&${data.pingRole}>`, embeds: [embed] })
            .then( async (message) => {
                await message.react('⏱')
            })
        }, hrs2) 
    }
});