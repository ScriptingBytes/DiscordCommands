const { Events, EmbedBuilder } = require('discord.js')
const chatSchema = require('../Schemas.js/callSchema');

module.exports = {
    name: Events.MessageCreate,

    async execute (message, client) {
        const { guild, author, channel } = message;

        if (author.bot || !guild || !channel) return;

        const serverData = await chatSchema.findOne({ 'guild1.id': guild.id });
        const serverData2 = await chatSchema.findOne({ 'guild2.id': guild.id });
        if (!serverData && !serverData2) return;

        if (serverData) {
            if (serverData.guild1.channelId !== channel.id) return;
            const msg = message.content;
            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setAuthor({ name: author.username, iconURL: author.displayAvatarURL({dynamic: true})})
            
            if (msg) embed.setDescription(msg)
            if (message?.attachments) embed.setImage(message.attachments.first()?.url)

            const otherChannel = client.channels.cache.get(serverData.guild2.channelId);
            if (!otherChannel) return;
            await otherChannel.send({ embeds: [embed] }).catch(err => { return; })

            await chatSchema.findOneAndUpdate({ 'guild1.id': guild.id }, { $push: { messages: `**By:** ${message.author}\n**From:** ${message.guild.name}\n**Message:** ${message.content}\n**Images:** <${message?.attachments?.first()?.url}>`}})
        } else if (serverData2) {
            if (serverData2.guild2.channelId !== channel.id) return;
            const msg = message.content;
            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setAuthor({ name: author.username, iconURL: author.displayAvatarURL({dynamic: true})})
            
            if (msg) embed.setDescription(msg)
            if (message?.attachments) embed.setImage(message.attachments.first()?.url)

            const otherChannel = client.channels.cache.get(serverData2.guild1.channelId);
            if (!otherChannel) return;
            await otherChannel.send({ embeds: [embed] }).catch(err => { return; })

            await chatSchema.findOneAndUpdate({ 'guild2.id': guild.id }, { $push: { messages: `**By:** ${message.author}\n**From:** ${message.guild.name}\n**Message:** ${message.content}\n**Images:** <${message?.attachments?.first()?.url}>`}})
        }
    }
}