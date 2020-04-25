const { gql } = require('apollo-server');

const schema = gql`
    type Data {
        info: String
        message: String
        status: String!
    }

    input User {
        name: String!
        email: String
        role: String
    }

    type Query {
        ping: String!
    }

    type SignupResponse {
        message: String
        status: String!
        api_key: String!
    }
    
    type Response {
        message: String
        status: String!
    }

    type Mutation {
        signup(user: User): SignupResponse
        pushMessage(channel: String, message: String): Response
        subscribe(channel: String): Response
        unsubscribe(channel: String): Response
    }

    type Subscription {
        data: Data
    }
`;

module.exports = schema