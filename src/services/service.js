const Db = require('../db.js')
const transport = require('../mail.js')
const database = new Db()

module.exports = {
    getAll: () => {
        return database.registros.find({}).toArray()
    },

    verifyMail: (email) => {
        return database.registros.findOne({ "email": email })
    },

    getOnePlayer: async (player) => {
        return database.registros.findOne({ "player": player})
    },

    addRegister: (doc) => {
        return database.registros.insertOne(doc)
    },

    changeRegister: (player, att) => {
        return database.registros.updateOne({ player : player}, att)
    },

    deleteRegister: (player) => {
        return database.registros.deleteOne({ player : player})
    },

    sendMail: ({email, subject, html}) => {
        return transport.sendMail({
            from: `<${process.env.GOOGLE_MAIL}>`,
            to: email,
            subject: subject,
            html: html
        })
    },
    addAmmount: async (ammount, player) => {
        return database.registros.updateOne({ player: player }, { $inc: { ammount: ammount } })
    },

    removeAmmount: async (ammount, player) => {
        return database.registros.updateOne({ player: player }, { $inc: { ammount: -ammount } })
    },

    createFeedback: async (name, message, date) => {
        return database.feedback.insertOne({ name: name, message: message, created_at: date })
    }
}