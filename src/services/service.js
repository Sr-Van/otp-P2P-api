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

    sendMail: ({email, subject, html}) => {
        return transport.sendMail({
            from: `<${process.env.GOOGLE_MAIL}>`,
            to: email,
            subject: subject,
            html: html
        })
    }
}