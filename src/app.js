const express = require('express')
const cors = require('cors')
const controller = require('./controllers/controller.js')

const app = express()
const PORT = 3000


app.use(cors({
    allowedHeaders: ['Content-Type'],  
}));

app.use(express.json())

app.get('/', (req, res) => {
    res.send('API rodando! 🥳')
})

app.get('/sales', controller.getAllSales)
app.get('/register/:player', controller.getOnePlayer)
app.post('/add-register', controller.addRegister)

app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

module.exports = app