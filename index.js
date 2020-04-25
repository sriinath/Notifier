const { ApolloServer } = require('apollo-server');
const resolvers = require('./resolvers')
const schema = require('./schema')
const authMiddleware = require('./auth')

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    subscriptions: {
        onConnect: (connectionParams) => {
            authMiddleware(connectionParams.Authorization || null)
            return {
                is_authenticated: true
            }
        }
    },
    context: async ({req, connection}) => {
        if (connection && connection.context && connection.context.is_authenticated) {
            return
        } else {
            const token = req.headers.authorization || '';
            authMiddleware(token)
            return
        }
    }
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});