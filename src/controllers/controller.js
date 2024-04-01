const service = require('../services/service.js')

module.exports = {
    getAllSales: async (req, res) => {
        let json = {error: 'error', results: []}
        try {
            const registros = await service.getAll()

            registros.forEach(registros_achados => {

                if (registros_achados.anuncios === null) {return}

                registros_achados.anuncios.forEach(anuncio => {

                    anuncio.player = registros_achados.player
                    anuncio.mundo = registros_achados.mundo
                    anuncio.badge = registros_achados.badge

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
            res.json(registro)
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

    addRegister: async (req, res) => {
        try {
            const doc = req.body
            await service.addRegister(doc)
            res.json({ "insert sended": "true" ,
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
    }
}