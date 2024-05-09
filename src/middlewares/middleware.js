const jwt = require('jsonwebtoken')


module.exports = {

/**
 * Middleware function to check the authentication token in the request headers.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {void} - Sends a response with a status code and message if the token is invalid or not present. Calls the next middleware function if the token is valid.
 */
    checkToken : (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) return res.status(401).json({ msg: 'Usuário não autenticado.' })

        try {
            jwt.verify(token, process.env.SECRET)
            next()
        } catch {
            res.status(400).json({ msg: 'Token inválido.' })
        }
    }
}