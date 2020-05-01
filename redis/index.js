const redis = require("redis");
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost'
const REDIS_PORT = process.env.REDIS_PORT || 6379
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || ''
class RedisClient {
    constructor() {
        this.client = redis.createClient({
            url: REDIS_URL,
            port: REDIS_PORT,
            password: REDIS_PASSWORD
        })
        this.client.on("connect", function() {
            console.log('redis connection successful');
        });
        
        this.client.on("error", function(error) {
            console.error('Error on connecting redis', error);
        });
    }
    closeConnection() {
        this.client.quit()
    }
    publishMessage(channel, message) {
        this.client.publish(channel, message)
    }
}

let redisCli = null;
const getActiveClient = () => {
    return new Promise((resolve, _) => {
        if(redisCli && redisCli.client) {
            redisCli.client.ping((err, result) => {
                if(err) {
                    console.log('Error while pinging redis subscriber client')
                    console.log(err)
                    redisCli = getNewClient()
                }
                console.log('Pinged redis', result)
                resolve(redisCli)
            })
        } else {
            redisCli = getNewClient()
            resolve(redisCli)
        }
    })
}
const getNewClient = () => new RedisClient()

module.exports = {
    getActiveClient,
    getNewClient
}