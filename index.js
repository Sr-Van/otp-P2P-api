const express = require('express')
const cors = require('cors')
const controller = require('./src/controllers/controller.js')
const moneyController = require('./src/controllers/money.controller.js')
const middleware = require('./src/middlewares/middleware.js')

const app = express()
const PORT = 3000


app.use(cors({
    allowedHeaders: ['Authorization','Content-Type'], 
    origin: '*' 
}));

app.use(express.json())

app.get('/', (req, res) => {
    res.send('API rodando! 🥳')
})

//public routes
app.post('/auth/login', controller.playerLogin)
app.post('/add-register', controller.addRegister)
app.get('/sales', controller.getAllSales)
app.get('/verification/:player', controller.verifyPlayer)
app.put('/confirm/acc/verification', controller.verifyEmailToken)

//private routes
app.get('/register/:player', middleware.checkToken, controller.getOnePlayer)
app.put('/add/offer/:player', middleware.checkToken, controller.addOffer)
app.put('/remove/offer', middleware.checkToken, controller.deleteOffer)
app.put('/add/trade', middleware.checkToken, controller.addTrade)
app.put('/add/rating/:player', middleware.checkToken, controller.addRating)
app.put('/trade/confirm/:type', middleware.checkToken, controller.confirmTrade)
app.put('/add/ammount/:player', middleware.checkToken, moneyController.addAmmount)
app.put('/remove/ammount/:player', middleware.checkToken, moneyController.removeAmmount)
app.delete('/delete/acc/:player', middleware.checkToken, controller.deleteAccount)
app.post('/send/mail', middleware.checkToken, controller.sendMail)

app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

module.exports = app