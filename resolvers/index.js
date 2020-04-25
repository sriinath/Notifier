const { PubSub } = require('apollo-server');
const { Client, redis } = require('../redis')
const pubsub = new PubSub();
const NotifyType = 'Notify_Client_Message'

let SubClient = new Client()

const getActiveSubscriber = (cbk) => {
    SubClient.client.ping(err => {
        if(err) {
            SubClient = new Subscriber()
        }
        cbk(SubClient)
    })
}

const resolvers = {
    Subscription: {
        data: {
            subscribe: (_, __, { username }) => {
                return pubsub.asyncIterator([NotifyType + username])
            }
        }
    },
    Query: {
        ping() {
            return 'Server is alive';
        }
    },
    Mutation: {
        signup(_, { user }, ___) {
            return sample_response
        },
        pushMessage(_, { channel, message }, ___) {
            return new Promise((resolve, _) => {
                redis.client.publish(channel, message, () => {
                    resolve({
                        status: 'Success',
                        message: 'Successfully published message to the channel' + channel    
                    })
                })
            })
        },
        subscribe(_, { channel }, {username}) {
            return new Promise((resolve, _) => {
                getActiveSubscriber(sub => {
                    sub.client.subscribe(channel, _ => {
                        sub.client.on('message', (channel, message) => {
                            pubsub.publish(NotifyType + username, {
                                data: {
                                    info: message,
                                    message: 'Successfully received message',
                                    status: 'Success',
                                    channel: channel
                                }
                            })
                        })
                        resolve({
                            subscribe: {
                                status: 'Success',
                                message: 'Successfully subscribed to the channel' + channel    
                            }
                        })
                    })
                })    
            })
        },
        unsubscribe(_, { channel }, ___) {
            return new Promise((resolve, _) => {
                getActiveSubscriber(sub => {
                    sub.client.unsubscribe(channel, _ => {
                        resolve({
                            status: 'Success',
                            message: 'Successfully unsubscribed to the channel' + channel    
                        })
                    })
                })
            })
        }
    },
};

module.exports = resolvers;