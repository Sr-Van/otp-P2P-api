const service = require('../services/service.js')
const bcrypt = require('bcrypt')

module.exports = {
    addAmmount: async (req, res) => {
        const {player} = req.params
        const {password, ammount} = req.body

        const playerExists = await service.getOnePlayer(player)

        if(!playerExists) {
            return res.status(404).json({msg: 'Jogador não encontrado.'})
        }

        const user = await service.verifyMail(playerExists.email)
        const checkPass = await bcrypt.compare(password, user.senha)

        if(!checkPass) {
            return res.status(422).json({msg: "senha invalida!"})            
        }

        if(Number(ammount) > 100) {
            return res.status(422).json({msg: 'Limite de 100'})
        }

        try {

            await service.addAmmount(Number(ammount), player)
            res.status(200).json({msg: 'Deposito feito com sucesso!'})
            
        } catch(error) {
            res.status(500).json({msg: 'Erro no servidor '})
        }
    }
}