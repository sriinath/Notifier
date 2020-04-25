const { PubSub } = require('apollo-server');
const pubsub = new PubSub();
const NotifyType = 'Notify_Client_Message'

const sample_response={
    'status': 'Success',
    'message': 'Requested Operation is Successful'
}

const resolvers = {
    Subscription: {
        data: {
            subscribe: () => pubsub.asyncIterator([NotifyType])
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
            return sample_response
        },
        subscribe(_, { channel }, ___) {
            return sample_response
        },
        unsubscribe(_, { channel }, ___) {
            return sample_response
        }
    },
};
module.exports = resolvers;