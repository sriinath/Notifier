const { AuthenticationError } = require('apollo-server');

const authMiddleware = token => {
    if (!token) {
        throw new AuthenticationError('Please try again by passing Authorization Header')
    }
}

module.exports = authMiddleware