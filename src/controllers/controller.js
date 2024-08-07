const service = require('../services/service.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mailcontroller = require('../controllers/mail.controller.js')

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

            res.status(200).json(json)
            
        }
    
        catch(error) {
            res.status(500).json({msg: 'Erro no servidor '+ error})
        }
    },

    getOnePlayer: async (req, res) => {

        try {

            const registro = await service.getOnePlayer(req.params.player)

            res.status(200).json(
                {
                    _id: registro._id,
                    player: registro.player,
                    nome: registro.nome,
                    email: registro.email,
                    mundo: registro.mundo,
                    badge: registro.badge,
                    ammount: registro.ammount,
                    verified: registro.verified,
                    anuncios: registro.anuncios,
                    vendas: registro.vendas,
                    compras: registro.compras,
                    avaliacao: registro.avaliacao,
                }
            )
        }
    
        catch(error) {
            res.status(500).json({msg: 'Erro no servidor '+ error})
        }
    },

    verifyPlayer: async (req, res) => {

        let json = {message: "Esse nickname ja está em uso!",verification : ""}

        try {

            const registro = await service.getOnePlayer(req.params.player)

            if (registro) {

                json.verification = "block"
                res.status(422).json(json)

            } else {

                json.verification = "release"
                json.message = "Nickname disponivel"

                return res.status(200).json(json)

            }
        }
    
        catch(error) {
            res.status(500).json({msg: 'Erro no servidor '+ error})
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

            res.status(200).json({
                msg: 'usuario logado com sucesso', 
                token: token,
                player: user.player,
                loggedAt: new Date()
            })

        } catch(err) {
            res.status(500).json(err)
        }
    },

    addRegister: async (req, res) => {

        const {email, senha, confirmSenha, player, nome, cpf, mundo} = req.body

        if(!player) return res.status(422).json({msg: 'Nickname obrigatóriorio.'})

        if(!nome) return res.status(422).json({msg: 'Nome obrigatório.'})

        if(!cpf) return res.status(422).json({msg: 'Cpf obrigatório.'})

        if(!mundo) return res.status(422).json({msg: 'Mundo obrigatório.'})

        if(!email) return res.status(422).json({msg: 'Email obrigatório.'})

        if(!senha) return res.status(422).json({msg: 'Senha obrigatória.'})

        if(!confirmSenha) return res.status(422).json({msg: 'Confirmar sua senha.'})

        if(!email || !senha) {
            return res.status(422).json({msg: 'Email ou senha invalido.'})
        }

        if(senha !== confirmSenha) {
            return res.status(422).json({msg: 'Senhas não batem.'})
        }

        const userExists = await service.verifyMail(email)

        if(userExists) return res.status(422).json({msg: 'Email já utilizado.'})

        const salt = await bcrypt.genSalt(12)
        const passHash = await bcrypt.hash(senha, salt)

        let doc = req.body
        doc.senha = passHash
        doc.ammount = 0
        doc.verified = false
        const verificationToken = jwt.sign(
            { email: doc.email }
            , process.env.SECRET)
        delete doc.confirmSenha

        try {

            await service.addRegister(doc)

            res.status(201).json(
                { 
                    insert_sended: "true" ,
                    msg: 'Cadastro realizado!',

                });

            mailcontroller.sendEmailToken({email: doc.email, token: verificationToken, player: doc.player});

        } 
        
        catch (error) {
            res.status(500).send('Internal Server Error' + error);
        }
    },

    verifyEmailToken: async (req, res) => {
        
        const {token, email} = req.body
        const decoded = jwt.verify(token, process.env.SECRET)


        if (decoded.email !== email) {
            return res.status(401).send('Invalid Token')
        }

        const userExists = await service.verifyMail(email)

        if(!userExists) {
            return res.status(404).json({msg: 'Email não encontrado.'})
        }

        if(userExists.verified) {
            return res.status(409).json({msg: 'Email ja verificado.'})
        }

        try {
            const att = { $set : {verified : true}}
            await service.changeRegister(userExists.player, att)
    
            res.status(201).json({msg: 'Email verificado com sucesso.'})

            mailcontroller.sendEmailConfirmed({email: userExists.email, player: userExists.player});
    
        } catch(error) {
            res.status(500).json({error: 'Erro no servidor ' +  error})
        }   
    },

    addOffer: async (req, res) => {

        const item = req.body
        const player = req.params.player

        const playerExists = await service.getOnePlayer(player)

        if(!playerExists) {
            return res.status(404).json({msg: 'Jogador não encontrado.'})
        }

        item.situation = "available"

        let playerOffers = playerExists.anuncios
        playerOffers.push(item)

        try {
            
            const att = { $set : {anuncios : playerOffers}}
            await service.changeRegister(player, att)

            res.status(201).json({msg: "Anuncio adicionado com sucesso!", 
            id: item.itemId})

        }
    
        catch(error) {
            res.status(500).json({error: 'Erro no servidor ' +  error})
        }
    },
    deleteOffer: async (req, res) => {
        const {player, itemId} = req.body

        const playerExists = await service.getOnePlayer(player)

        if(!playerExists) {
            return res.status(404).json({msg: 'Jogador não encontrado.'})
        }

        let playerOffers = playerExists.anuncios

        let newOffers = playerOffers.filter(item => item.itemId !== itemId)

        try {
            
            const att = { $set : {anuncios : newOffers}}
            await service.changeRegister(player, att)

            res.status(201).json({msg: "Anuncio removido com sucesso!"})
        } catch(error) {
            res.status(500).json({error: 'Erro no servidor ' +  error})
        }   
    },
    
    addTrade: async (req, res) => {

        //getting just usefull data
        const {player, itemId, trade_player} = req.body

        const playerExists = await service.getOnePlayer(player)
        const playerTradeExists = await service.getOnePlayer(trade_player)

        if(!playerExists || !playerTradeExists) {
            return res.status(404).json({msg: 'Jogador não encontrado.'})
        }

        
        
        try {
            
            const playerOffers = playerExists.anuncios
    
            let itemExists = playerOffers.filter(item => item.itemId === itemId)[0]
    
            if(!itemExists) {
                return res.status(404).json({msg: 'Item não encontrado.'})
            }
    
            itemExists.situation = 'ordered'
            itemExists.trade_player = trade_player
            
            const newOffers = playerOffers.filter(item => item.itemId !== itemId)
    
            let newSales = playerExists.vendas
            let newTradePlayerShopping = playerTradeExists.compras
    
            newSales.push(itemExists)
            

            const attPlayer = { 
                $set : {
                    anuncios : newOffers,
                    vendas : newSales
            }}
            await service.changeRegister(player, attPlayer)

            itemExists.trade_player = player
            newTradePlayerShopping.push(itemExists)
            const attPlayerTrade = { 
                $set : {
                    compras : newTradePlayerShopping
            }}

            await service.changeRegister(trade_player, attPlayerTrade)

            res.status(201).json({msg: 'Anuncios atualizados.'})
        } catch(error) {
            res.status(500).json({msg: 'Erro no servidor ' + error})
        }

    
    },

    cancelTrade: async (req, res) => {

        const type = req.params.type
        const {player, itemId, password} = req.body

        const playerExists = await service.getOnePlayer(player)

        if(!playerExists) {
            return res.status(404).json({msg: 'Jogador não encontrado.'})
        }

        const checkPass = await bcrypt.compare(password, playerExists.senha)

        if(!checkPass) {
            return res.status(422).json({msg: "senha invalida!"})            
        }

        if(type === 'buyer') {
            let itemExists = playerExists.compras.filter(item => item.itemId === itemId)[0]

            if(!itemExists) {
                res.status(404).json({msg: 'Item não encontrado.'})
                return
            }
            
            if(itemExists.situation !== 'ordered') {
                res.status(404).json({msg: 'Item já em processo de troca.'})
                return
            } 

            const newBuys = playerExists.compras.filter(item => item.itemId !== itemId)

            itemExists.situation = 'available'

            const playerTrade = await service.getOnePlayer(itemExists.trade_player)
            const newTradePlayerSales = playerTrade.vendas.filter(item => item.itemId !== itemId)
            let newTradePlayerOffers = playerTrade.anuncios
            delete itemExists.trade_player
            newTradePlayerOffers.push(itemExists)

            try {

                await service.changeRegister(playerExists.player, {
                    $inc : {
                        ammount : Number(itemExists.price)
                    }
                })
    
                const playerAtt = {
                    $set : {
                        compras : newBuys
                    }
                }
                const playerTradeAtt = {
                    $set : {
                        vendas : newTradePlayerSales,
                        anuncios : newTradePlayerOffers
                    }
                }
                await service.changeRegister(player, playerAtt)
                await service.changeRegister(playerTrade.player, playerTradeAtt)
    
    
                res.status(201).json({msg: 'Troca cancelada e dinheiro devolvido.'})
            }
            catch(error) {
                res.status(500).json({msg: 'Erro no servidor '})
            }
            return
        }
        
        let itemExists = playerExists.vendas.filter(item => item.itemId === itemId)[0]

        if(!itemExists) return res.status(404).json({msg: 'Item não encontrado.'})

        if(itemExists.situation !== 'ordered') {
            res.status(404).json({msg: 'Item já em processo de troca.'})
            return
        } 

        const newSales = playerExists.vendas.filter(item => item.itemId !== itemId)
        let newPlayerOffers = playerExists.anuncios

        itemExists.situation = 'available'

        const playerTrade = await service.getOnePlayer(itemExists.trade_player)
        const newTradePlayerBuys = playerTrade.compras.filter(item => item.itemId !== itemId)
        
        delete itemExists.trade_player
        newPlayerOffers.push(itemExists)

        try {

            await service.changeRegister(playerTrade.player, {
                $inc : {
                    ammount : Number(itemExists.price)
                }
            })

            const playerAtt = {
                $set : {
                    vendas : newSales,
                    anuncios : newPlayerOffers
                }
            }
            const playerTradeAtt = {
                $set : {
                    compras : newTradePlayerBuys
                }
            }
            await service.changeRegister(player, playerAtt)
            await service.changeRegister(playerTrade.player, playerTradeAtt)

        res.status(201).json({msg: 'Troca cancelada.'})
        }
        catch(error) {
            res.status(500).json({msg: 'Erro no servidor '})
        }

       
    },

    confirmTrade: async (req, res) => { 

        const type = req.params.type
        const {seller, itemId, buyer} = req.body

        const sellerExists = await service.getOnePlayer(seller)
        const buyerExists = await service.getOnePlayer(buyer)

        
        if(!sellerExists || !buyerExists) {
            return res.status(404).json({msg: 'Jogador não encontrado.'})
        }
        
        let itemSellerExists = sellerExists.vendas.filter(item => item.itemId === itemId)[0]
        let itemBuyerExists = buyerExists.compras.filter(item => item.itemId === itemId)[0]
        
        if(!itemSellerExists || !itemBuyerExists) {
            return res.status(404).json({msg: 'Item não encontrado.'})
        }
        
        if(type === 'seller') {
            itemSellerExists.situation = 'sended'
            itemBuyerExists.situation = 'sended'
        } else {
            itemSellerExists.situation = 'received'
            itemBuyerExists.situation = 'received'
        }

        let newSales = sellerExists.vendas.filter(item => item.itemId !== itemId)
        newSales.push(itemSellerExists)


        let newShopping = buyerExists.compras.filter(item => item.itemId !== itemId)

        newShopping.push(itemBuyerExists)


        try {

            const attSeller = { $set : {vendas : newSales}}
            const attBuyer = { $set : {compras : newShopping}}

            await service.changeRegister(seller, attSeller)
            await service.changeRegister(buyer, attBuyer)

            if(type !== 'seller') {
                const attAmmountSeller = { $inc : {ammount : Number(itemBuyerExists.price)}}
                await service.changeRegister(seller, attAmmountSeller)
            }

            res.status(201).json({msg: 'Registros dos clientes atualizados.'})
        } catch(error) {
            res.status(500).json({msg: 'Erro no servidor '})
        }

    },

    addRating: async (req, res) => {

        const player = req.params.player
        const {rating, player_rating} = req.body

        const playerExists = await service.getOnePlayer(player)
        const playerRatingExists = await service.getOnePlayer(player_rating)

        if(!playerExists || !playerRatingExists) {
            return res.status(404).json({msg: 'Jogador não encontrado.'})
        }

        let playerRating = playerExists.avaliacao
        playerRating.push(req.body)

        try {
            
            const att = { $set : {avaliacao : playerRating}}
            await service.changeRegister(req.params.player, att)

            res.status(201).json({msg: 'Avaliação enviada e registrada no banco.'})
        }
    
        catch(error) {
            res.status(500).json({msg: 'Erro no servidor '+ error})
        }
    },

    deleteAccount: async (req, res) => {

        const player = req.params.player
        const playerExists = await service.getOnePlayer(player)

        if(!playerExists) {
            return res.status(404).json({msg: 'Jogador não encontrado.'})
        }

        try {
            await service.deleteRegister(player)

            res.status(201).json({msg: 'Conta excluída com sucesso!'})

        } catch(error) {
            res.status(500).json({msg: 'Erro no servidor '})
        }
    },

    sendMail: async (req, res) => {

        const {type, mail, item, player} = req.body

        const userExists = await service.verifyMail(mail)

        if(!userExists) {
            return res.status(404).json({msg: 'Este e-mail não está cadastrado.'})
        }


        const html = `
                        <h1>${templates.html[type]}</h1>
                        <p>Olá ${player}, o item: ${item} ${templates.text[type]}</p>
                    `
        
        const subject = templates.subject[type]

        try {

            await service.sendMail({email: mail, html: html, subject: subject})

            res.status(200).json({
                email_sended: true,
                msg: 'Seu e-mail foi enviado.'
            })

        }

        catch(error) {
            res.status(500).json({msg: 'Erro no servidor '+ error})
        }
    },

    sendFeedback: async (req, res) => {

        const {name, message} = req.body;

        const userExists = await service.getOnePlayer(name);

        if(!userExists) {
            return res.status(404).json({msg: 'Jogador não encontrado.'})
        }

        let d = new Date();
        const date = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`
        
        try {
            await service.createFeedback(name, message, date);
            res.status(201).json({msg: 'Feedback enviado com sucesso!'})
        } catch(error) {
            return res.status(500).json({msg: 'Erro no servidor '+ error})
        }
        
    }
}