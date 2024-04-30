const express = require('express')
const cors = require('cors')
const controller = require('./src/controllers/controller.js')
const middleware = require('./src/middlewares/middleware.js')

const app = express()
const PORT = 3000


app.use(cors({
    allowedHeaders: ['Authorization','Content-Type'],  
}));

app.use(express.json())

app.get('/', (req, res) => {
    res.send('API rodando! 🥳')
})

app.post('/auth/login', controller.playerLogin)
app.get('/sales', controller.getAllSales)
app.get('/register/:player', middleware.checkToken, controller.getOnePlayer)
app.post('/add-register', controller.addRegister)
app.get('/verification/:player', controller.verifyPlayer)
app.put('/add/offer/:player', middleware.checkToken, controller.addOffer)
app.put('/add/sale/:player', middleware.checkToken, controller.addSale)
app.put('/add/shopping/:player', middleware.checkToken, controller.addShopping)
app.put('/add/rating/:player', middleware.checkToken, controller.addRating)
app.post('/send/mail', middleware.checkToken, controller.sendMail)

app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

module.exports = app