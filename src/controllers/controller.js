const service = require('../services/service.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const templates = {
    html: {
        compra: 'Aguardando envio do vendedor!',
        venda: 'Alguem quer comprar seu item!',
        confirm_compra: 'Obrigado por sua compra.',
        confirm_venda: 'Obrigado por vender conosco.'
    },

    text: {
        compra: 'está separado e o vendedor já foi notificado!',
        venda: 'foi comprado e o comprador aguarda seu envio.',
        confirm_compra: 'foi entregue e agora você pode aproveita-lo.',
        confirm_venda: 'foi vendido, parabens pela sua venda.'
    },

    subject: {
        compra: 'Muito proximo do seu item!',
        venda: 'Alguem está comprando seu item!',
        confirm_compra: 'Item comprado.',
        confirm_venda: 'Item vendido.'
    }
}

module.exports = {
    getAllSales: async (req, res) => {
        let json = {error: 'error', results: []}
        try {
            const registros = await service.getAll()

            registros.forEach(registros_achados => {

                if (registros_achados.anuncios === null) {return}

                registros_achados.anuncios.forEach(anuncio => {

                    anuncio.player = registros_achados.player
                    anuncio.badge = registros_achados.badge
                    anuncio.playerType = registros_achados.playerType

                    json.results.push(anuncio)
                })
            })
            res.json(json)
        }
    
        catch(error) {
            res.status(500).send()
        }
    },

    getOnePlayer: async (req, res) => {
        try {
            const registro = await service.getOnePlayer(req.params.player)
            res.json(
                {
                    _id: registro._id,
                    player: registro.player,
                    nome: registro.nome,
                    mundo: registro.mundo,
                    badge: registro.badge,
                    anuncios: registro.anuncios,
                    vendas: registro.vendas,
                    compras: registro.compras,
                    avaliacao: registro.avaliacao,
                }
            )
        }
    
        catch(error) {
            res.status(500).send()
        }
    },

    verifyPlayer: async (req, res) => {
        let json = {message: "Esse nickname ja está em uso!",verification : ""}
        try {
            const registro = await service.getOnePlayer(req.params.player)
            if (registro) {
                json.verification = "block"
            } else {
                json.verification = "release"
                json.message = "Nickname disponivel"
            }

            res.json(json)
        }
    
        catch(error) {
            res.status(500).send()
        }
    },

    playerLogin: async (req, res) => {

        const {email, senha} = req.body

        if(!email || !senha) {
            return res.status(422).json({msg: "campos não enviados."})
        }

        const user = await service.verifyMail(email)

        if(!user) {
            return res.status(404).json({msg: 'usuario nao encontrado'})
        }


        const checkPass = await bcrypt.compare(senha, user.senha)

        if(!checkPass) {
            return res.status(422).json({msg: "senha invalida!"})            
        }

        try {
            const secret = process.env.SECRET
            const token = jwt.sign({
                id: user._id
            }, secret)

            res.status(200).json({msg: 'usuario logado com sucesso', token: token})

        } catch(err) {
            res.status(500).json(err)
        }
    },

    addRegister: async (req, res) => {

        const {email, senha, confirmSenha} = req.body

        if(!email || !senha) {
            return res.status(422).json({msg: 'email ou senha invalido'})
        }

        if(senha !== confirmSenha) {
            return res.status(422).json({msg: 'senhas não batem.'})
        }

        const userExists = service.verifyMail(email)

        if(userExists) {
            return res.status(422).json({msg: 'email já utilizado.'})
        }

        const salt = await bcrypt.genSalt(12)
        const passHash = await bcrypt.hash(senha, salt)

        let doc = req.body
        doc.senha = passHash

        try {

            await service.addRegister(doc)
            res.status(201).json({ "insert sended": "true" ,
                      "doc": doc});
        } 
        
        catch (error) {
            res.status(500).send('Internal Server Error' + error);
        }
    },

    addOffer: async (req, res) => {

        try {
            
            const att = { $set : {anuncios : req.body.anuncios}}
            const registro = await service.changeRegister(req.params.player, att)

            res.json(registro)
        }
    
        catch(error) {
            res.status(500).send()
        }
    },

    addSale: async (req, res) => {
        try {
            
            const att = { $set : {vendas : req.body.vendas}}
            const registro = await service.changeRegister(req.params.player, att)

            res.json(registro)
        }
    
        catch(error) {
            res.status(500).send()
        }
    },

    addShopping: async (req, res) => {
        try {
            
            const att = { $set : {compras : req.body.compras}}
            const registro = await service.changeRegister(req.params.player, att)

            res.json(registro)
        }
    
        catch(error) {
            res.status(500).send()
        }
    },

    addRating: async (req, res) => {
        try {
            
            const att = { $set : {avaliacao : req.body.avaliacao}}
            const registro = await service.changeRegister(req.params.player, att)

            res.json(registro)
        }
    
        catch(error) {
            res.status(500).send()
        }
    },

    sendMail: async (req, res) => {
        const type = req.body.type
        const mail = req.body.mail
        const item = req.body.item
        const player = req.body.player
        const html = `
                        <h1>${templates.html[type]}</h1>
                        <p>Olá ${player}, o item: ${item} ${templates.text[type]}</p>
                    `
        
        const subject = templates.subject[type]

        try {
            await service.sendMail({email: mail, html: html, subject: subject})
            res.json({
                email_sended: true,
                type: type,
                item: item
            })
        }

        catch(error) {
            res.status(500).send(error)
        }
    }
}