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
        res.status(500).send()
    }
})

app.post('/add-registro', async (req, res) => {
    try {
        const doc = req.body
        await db.registros.insertOne(doc);
    
        res.json({ "insert sended": "true" ,
                  "doc": doc});
      } catch (error) {
        res.status(500).send('Internal Server Error' + error);
      }
})

app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

module.exports = app