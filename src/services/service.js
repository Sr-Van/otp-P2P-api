const Db = require('../db.js')
const database = new Db()

module.exports = {
    getAll: () => {
        return database.registros.find({}).toArray()
    },
    
    addRegistro: (doc) => {
        return database.registros.insertOne(doc)
    }
}