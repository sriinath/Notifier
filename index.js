const { ApolloServer } = require('apollo-server');
const resolvers = require('./resolvers')
const schema = require('./schema')
const contextMiddleware = require('./auth')

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    subscriptions: {
        onConnect: (connectionParams) => {
            return contextMiddleware(connectionParams.Authorization || null)
        }
    },
    context: async ({req, connection}) => {
        if (connection && connection.context && connection.context.username) {
            return connection.context
        } else {
            const token = req.headers.authorization || '';
            return contextMiddleware(token)
        }
    }
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});