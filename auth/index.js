const { AuthenticationError } = require('apollo-server');
const { redis } = require('../redis')

const contextMiddleware = token => {
    if (!token) {
        throw new AuthenticationError('Please try again by passing Authorization Header')
    } else {
        return {
            username: 123,
            client: redis
        }
    }
}

module.exports = contextMiddleware