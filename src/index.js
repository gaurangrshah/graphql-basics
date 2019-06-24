import { GraphQLServer, PubSub } from 'graphql-yoga';
// GraphQLServer allows us to create a graphql server using the yoga library.
import db from './db';
import Query from './resolvers/Query'
import Mutation from './resolvers/Mutation';
import Subscription from './resolvers/Subscription';
import Post from './resolvers/Post';
import User from './resolvers/User';
import Comment from './resolvers/Comment';


const pubsub = new PubSub();

const resolvers = {
  Query,
  Mutation,
  Subscription,
  Post,
  User,
  Comment,
}


const server = new GraphQLServer({
  // typeDefs,
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    db, // setting database to context.
    pubsub  // making pubsub instance accessible to resolvers
  }
});

server.start({ port: 4001 }, () => {
  console.log('served up')
});
