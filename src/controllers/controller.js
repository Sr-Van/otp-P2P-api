const service = require('../services/service.js')

module.exports = {
    getAll: async (req, res) => {
        try {
            const registros_achados = await service.getAll()
            res.json(registros_achados)
        }
    
        catch(error) {
            res.status(500).send()
        }
    },

    getOne: async (req, res) => {
        try {
            const registro = await service.getOne(req.params.player)
            res.json(registro)
        }
    
        catch(error) {
            res.status(500).send()
        }
    },

    addRegistro: async (req, res) => {
        try {
            const doc = req.body
            await service.addRegistro(doc)
            res.json({ "insert sended": "true" ,
                      "doc": doc});
        } 
        
        catch (error) {
            res.status(500).send('Internal Server Error' + error);
        }
    }
}