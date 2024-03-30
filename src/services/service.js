const Db = require('../db.js')
const database = new Db()

module.exports = {
    getAll: () => {
        return database.registros.find({}).toArray()
    },

    getOne: async (player) => {
        return database.registros.findOne({ "player": player})
    },

    addRegistro: (doc) => {
        return database.registros.insertOne(doc)
    }
}