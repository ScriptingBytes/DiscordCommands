const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chatSchema = require('../../Schemas.js/callSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("globalchat")
    .setDescription("Global chat commands")
    .addSubcommand(sc => sc
        .setName("connect")
        .setDescription("Connect to a chat with another server"))
    .addSubcommand(sc => sc
        .setName("hangup")
        .setDescription("Hang up the phone")),

    async execute (interaction, client) {
        await interaction.deferReply();
        const { guild, user, options, channel } = interaction;
        const s = options.getSubcommand()

        const data = await chatSchema.findOne({ 'guild1.id': guild.id })
        const data2 = await chatSchema.findOne({ 'guild2.id': guild.id });

        if (s === 'connect') {
            let allGuilds = await chatSchema.find();

            if (data || data2) {
                await chatSchema.findOneAndDelete({ 'guild1.id': guild.id });
                await interaction.editReply({ content: "I hung up the phone..." })
                return;
            }

            await interaction.editReply({ content: "Connecting...", ephemeral: true })
            await chatSchema.create({
                guild1: {
                    id: guild.id,
                    channelId: channel.id
                },
            })

            if (allGuilds.length <= 1) {
                const msg = await channel.send({ content: "Looking for users to talk to..."})
                timeout = setTimeout(async() => {
                        const onlyThisGuild = (await chatSchema.find()).filter((g) => (g.guild1 == guild.id));
                        if (onlyThisGuild.length >= 1) {
                                await chatSchema.findOneAndDelete({ 'guild1.id': guild.id })
                                return await msg.edit({ content: "I couldn't find anybody on the phone right now." })
                            }
                }, 13500)
            }

            allGuilds = await chatSchema.find()

            if (allGuilds.length > 1) {
                const otherGuilds = allGuilds.filter(g => g.guild1.id !== guild.id);
                otherGuilds.filter(g => !g?.guild2)

                try {
                    const index = allGuilds.indexOf({ guild1: { id: guild.id, channelId: interaction.channel.id } })
                    let thisGuild = allGuilds.filter(g => g.guild1.id == guild.id)
                    let otherGuild = otherGuilds[0];

                    const otherChannel = client.channels.cache.get(otherGuild.guild1.channelId);

                    await chatSchema.findOneAndDelete({
                        'guild1.id':  guild.id
                    })
                    await chatSchema.findOneAndDelete({
                        'guild1.id': otherGuild.guild1.id
                    });

                    await chatSchema.create({
                        guild1: {
                            id: guild.id,
                            channelId: interaction.channel.id
                        },
                        guild2: {
                            id: otherGuild.guild1.id,
                            channelId: otherGuild.guild1.channelId
                        }
                    })

                    otherGuild = client.guilds.cache.get(otherGuild.guild1.id)
                    thisGuild = client.guilds.cache.get(thisGuild[0].guild1.id)
                    await channel.send(`You connected to a call!`)
                    await otherChannel.send(`You connected to a call!`)

                    // Disconnection timer:
                    setTimeout(async () => {
                        
                        const newData = await chatSchema.findOne({ 'guild1.id': guild.id })
                        const newData2 = await chatSchema.findOne({ 'guild2.id': guild.id })
                        if (!newData && !newData2) return;

                        let oneChannel = client.channels.cache.get(newData?.guild1?.channelId)
                        let twoChannel = client.channels.cache.get(newData?.guild2?.channelId)
                        if (!newData?.guild1 || !newData?.guild2 ) {
                            oneChannel = client.channels.cache.get(newData2?.guild1?.channelId)
                            twoChannel = client.channels.cache.get(newData2?.guild2?.channelId)
                        }

                        await oneChannel.send({ content: "WARNING: The call is going to disconnect in 30 seconds..."})
                        await twoChannel.send({ content: "WARNING: The call is going to disconnect in 30 seconds..."})
                    }, 90000) // 30 second warning (150000 ms)

                    setTimeout(async () => {
                        let beforeData = await chatSchema.findOneAndDelete({ 'guild1.id': guild.id})
                        if (!beforeData?.guild1) beforeData = await chatSchema.findOneAndDelete({ 'guild2.id': guild.id}) // Covers both areas where the guild id could be (guaranteed deletion)
                        if (!beforeData) return;

                        const oneChannel = client.channels.cache.get(beforeData.guild1.channelId)
                        const twoChannel = client.channels.cache.get(beforeData.guild2.channelId)

                        await oneChannel.send({ content: "The 3 minutes have ran up, both callers have been disconnected!"})
                        await twoChannel.send({ content: "The 3 minutes have ran up, both callers have been disconnected!"})
                      
                        const logChannel = await client.channels.cache.get('1156418648051818546'); // ENTER IN YOUR LOG ID, IF YOU DON'T WANT TO LOG THE CHATS, DELETE THIS AND THE RETURN STATEMENT BELOW!!!
                        return await logChannel.send({ content: `${beforeData.messages.join('\n\n')}`})
                    }, 120000) // Disconnects both parties
                } catch (err) {
                    console.log(err)
                }
            } 
        } else if (s === 'hangup') {
            if (data) {
                const beforeData = await chatSchema.findOneAndDelete({ 'guild1.id': guild.id });
                if (beforeData?.guild2.id) {
                    const otherChannel = client.channels.cache.get(beforeData.guild2.channelId)
                    await otherChannel.send('The other end of the line hung up on you.')
                }
                await interaction.editReply({ content: "I hung up the phone..." })

                const logChannel = await client.channels.cache.get('1156418648051818546'); // ENTER IN YOUR LOG ID, IF YOU DON'T WANT TO LOG THE CHATS, DELETE THIS AND THE RETURN STATEMENT BELOW!!!
                return await logChannel.send({ content: `${beforeData.messages.join('\n\n')}`})
            } else if (data2) {
                const beforeData = await chatSchema.findOneAndDelete({ 'guild2.id': guild.id });
                const otherChannel = client.channels.cache.get(beforeData.guild1.channelId)
                await otherChannel.send('The other end of the line hung up on you.')
                await interaction.editReply({ content: "I hung up the phone..." })
                
                const logChannel = client.channels.cache.get('1156418648051818546'); // ENTER IN YOUR LOG ID, IF YOU DON'T WANT TO LOG THE CHATS, DELETE THIS AND THE RETURN STATEMENT BELOW!!!
                return await logChannel.send({ content: `${beforeData.messages.join('\n\n')}`})
            } else {
                return await interaction.editReply({ content: "You are not in a call right now." })
            }
        }
    }
}