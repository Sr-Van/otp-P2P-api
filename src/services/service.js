const Db = require('../db.js')
const database = new Db()

module.exports = {
    getAll: () => {
        return database.registros.find({}).toArray()
    },

    getOnePlayer: async (player) => {
        return database.registros.findOne({ "player": player})
    },

    addRegister: (doc) => {
        return database.registros.insertOne(doc)
    }
}