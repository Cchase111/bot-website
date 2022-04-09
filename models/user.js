const {model , Schema } = require("mongoose")
const User = new Schema({
profile: {
type: String
}
})
module.exports = model('User', User);