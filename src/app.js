const express = require('express')
const cors = require('cors')
const Db = require('./db.js')


const app = express()
const PORT = 3000
const db = new Db()

app.use(cors({
    allowedHeaders: ['Content-Type'],  
}));

app.use(express.json())

app.get('/', (req, res) => {
    res.send('API rodando! 🥳')
})

app.get('/registros', async (req, res) => {
    try {
        const cursor = db.registros.find({})
        const registros_achados = await cursor.toArray()
        res.json(registros_achados)
    }

    catch(error) {
        console.log('Error fetching registers', error)
        res.status(500).send()
    }
})

app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

module.exports = app