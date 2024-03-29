const { MongoClient } = require('mongodb')


require("dotenv").config()

require('dotenv').config({
    path: '../.env'
})

class Db {
    client = new MongoClient(process.env.MONGO_URI)
    database = this.client.db('Otp-P2P')
    registros = this.database.collection('registros')
}


module.exports = Db
