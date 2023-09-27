const { model, Schema } = require(`mongoose`)

let bumpSchema = new Schema({
    guild: String,
    description: String,
    pingRole: String
})

module.exports = model('bump-remind_x', bumpSchema)