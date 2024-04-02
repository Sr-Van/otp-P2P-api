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
app.get('/verification/:player', controller.verifyPlayer)
app.put('/add/offer/:player', controller.addOffer)
app.put('/add/sale/:player', controller.addSale)
app.put('/add/shopping/:player', controller.addShopping)
app.put('/add/rating/:player', controller.addRating)
app.post('/send/mail', controller.sendMail)

app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

module.exports = app