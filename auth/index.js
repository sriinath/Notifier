const { AuthenticationError } = require('apollo-server');
const { REDIS_ACCESS_KEY } = require('../constants');
const { getActiveClient } = require('../redis');

const authMiddleware = async token => {
    if (!token) {
        throw new AuthenticationError('Please try again by passing Authorization Header')
    } else {
        try {
            const redis_cli = await getActiveClient()
            return new Promise((resolve, reject) => redis_cli.client.hexists(REDIS_ACCESS_KEY, token, (err, result) => {
                if(err) {
                    reject({reason: 'Something went wrong while authenticating user'})
                } else if(result) {
                    resolve({
                        username: result
                    })
                } else {
                    reject({reason: 'Token passed in header is not valid :-;'})
                }
            }))
            .catch(err => {
                console.log(err.reason)
                throw new AuthenticationError(err.reason)
            })
        } catch(err) {
            throw new AuthenticationError(err)
        }
    }
}

module.exports = authMiddleware