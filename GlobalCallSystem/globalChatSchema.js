const { model, Schema } = require('mongoose');

const schema = new Schema({
    guild1: {
        id: String,
        channelId: String
    },
    guild2: {
        id: String,
        channelId: String,
    },
    messages: Array
})

module.exports = model('call_schema', schema)