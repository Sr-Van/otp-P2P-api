const { MongoClient } = require('mongodb')


require("dotenv").config()

require('dotenv').config({
    path: '../.env'
})

class Db {

    /**
     * Initializes a new instance of the class and establishes a connection to the MongoDB database.
     *
     * @return {void}
     */
    constructor() {
        this.client = new MongoClient(process.env.MONGO_URI)
        this.database = this.client.db('Otp-P2P')
        this.registros = this.database.collection('registros')
    }

}


module.exports = Db
