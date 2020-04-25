const redis = require("redis");

class RedisClient {
    constructor() {
        this.client = redis.createClient()
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

module.exports = RedisClient