const { ApolloServer } = require('apollo-server');
const resolvers = require('./resolvers')
const schema = require('./schema')

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    subscriptions: {
        onConnect: async (connectionParams) => {
            return {
                token: connectionParams.Authorization || null
            }
        }
    },
    context: async ({req, connection}) => {
       if (connection && connection.context && connection.context.token) {
            return connection.context
        } else {
            const token = req.headers.authorization || null;
            return {
                token
            }
        }
    }
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});