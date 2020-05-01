const { PubSub } = require('apollo-server');
const crypto = require('crypto')
const { getNewClient, getActiveClient } = require('../redis');
const authMiddleware = require('../auth')

const { NotifyType, REDIS_USER, REDIS_ACCESS_KEY } = require('../constants');

const pubsub = new PubSub();
let SubClient = null;

const getActiveSubscriber = (cbk) => {
    if(SubClient && SubClient.client) {
        SubClient.client.ping(err => {
            if(err) {
                console.log('Error while pinging redis subscriber client')
                console.log(err)
                SubClient = getNewClient()
            }
            cbk(SubClient)
        })
    } else {
        SubClient = getNewClient()
        cbk(SubClient)
    }
}

const resolvers = {
    Subscription: {
        data: {
            subscribe: async (_, __, { token }) => {
                const authInfo = await authMiddleware(token)
                const {
                    username
                } = authInfo
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
        async signup(_, { user }, __) {
            const redis = await getActiveClient()
            if(user && user.username) {
                const { username } = user
                return new Promise((resolve, _) => {
                    redis.client.hexists(REDIS_USER, username, async (err, result) => {
                        if(err) {
                            resolve({
                                status: 'Failure',
                                message: 'Something Went wrong',
                                api_key: null
                            })
                        } else {
                            if(!result) {
                                const temp_user =  JSON.stringify({...user})
                                const access_token = crypto.randomBytes(48).toString('hex')
                                temp_user.access_token = access_token
                                Promise.all([
                                    redis.client.hset(REDIS_USER, username, temp_user),
                                    redis.client.hset(REDIS_ACCESS_KEY, access_token, username)
                                ]).then(_ => {
                                    resolve({
                                        status: 'Success',
                                        message: 'This API key can not be retreived again. Hence be cautious',
                                        api_key: access_token
                                    })
                                })
                                .catch(err => {
                                    console.log('Error while creating user', err)
                                    resolve({
                                        status: 'Failure',
                                        message: 'Error while creating user',
                                        api_key: null
                                    })
                                })
                            } else {
                                resolve({
                                    status: 'Failure',
                                    message: 'User Already exists',
                                    api_key: null
                                })
                            }
                        }
                    })    
                })
            } else {
                return {
                    status: 'Failure',
                    message: 'Username is mandatory',
                    api_key: null
                }
            }
        },
        async pushMessage(_, { channel, message }, { token }) {
            await authMiddleware(token)
            const redis = await getActiveClient()
            return new Promise(async (resolve, _) => {
                redis.client.publish(channel, message, err => {
                    if(err) {
                        console.log('Error while publishing message in channel')
                        console.log({
                            channel,
                            message,
                            err
                        })
                        resolve({
                            status: 'Failure'
                        })
                    } else {
                        resolve({
                            status: 'Success'
                        })
                    }
                })
            })
        },
        async subscribe(_, { channel }, { token }) {
            const authInfo = await authMiddleware(token)
            const {
                username
            } = authInfo
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
                            status: 'Success',
                            message: 'Successfully subscribed to the channel' + channel    
                        })
                    })
                })    
            })
        },
        async unsubscribe(_, { channel }, ___) {
            await authMiddleware(token)
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