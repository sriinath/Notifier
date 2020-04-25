const RedisClient = require('./client');

module.exports = {
    redis: new RedisClient(),
    Client: RedisClient
}