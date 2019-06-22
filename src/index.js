import { GraphQLServer } from 'graphql-yoga';
// GraphQLServer allows us to create a graphql server using the yoga library.
import uuidv4 from 'uuid/v4';
// version 4 of uuid - generates completely random ids.

// Demo user data
let users = [{
  id: '1',
  name: 'Jane',
  email: 'info@infoesque.net'
}, {
  id: '2',
  name: 'John',
  email: 'info2@infoesque.net'
}, {
  id: '3',
  name: 'Mike',
  email: 'info3@infoesque.net'
}]

let posts = [{
  id: '001',
  title: 'Post Title 1',
  body: 'Some Lorem for post 1',
  published: true,
  author: '1'
}, {
  id: '002',
  title: 'Post Title 2',
  body: 'Some Lorem for post 2',
  published: true,
  author: '1'
}, {
  id: '003',
  title: 'Post Title 3',
  body: 'Some Lorem for post 3',
  published: false,
  author: '3'
}]

let comments = [{
  id: '001',
  text: 'comment for 1',
  author: '2',
  post: '001'
}, {
  id: '002',
  text: 'comment for 2',
  author: '3',
  post: '003'
}, {
  id: '003',
  text: 'comment for 3',
  author: '3',
  post: '001'
}, {
  id: '004',
  text: 'comment for 4',
  author: '1',
  post: '003'
}]

const typeDefs = `
	type Query {
    users(query: String): [User!]
    me: User!
    post: Post!
    posts(query: String): [Post!]
    comments: [Comment!]
  }

  type Mutation {
    createUser(data: CreateUserInput!): User!
    deleteUser(id: ID!): User!
    createPost(data: CreatePostInput!): Post!
    deletePost(id: ID!): Post!
    createComment(data: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Comment!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  input CreateCommentInput {
    text: String!
    author: ID!
    post: ID!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`;

const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) return users;
      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      })
    },
    me() {
      return {
        id: "123098",
        name: "Mike",
        email: "mike@example.com"
      }
    },
    post() {
      return {
        id: "001",
        title: "First Post Title",
        body: "Some Lorem Ipsum for the post body",
        published: false
      }
    },
    posts(parent, args, ctx, info) {
      if (!args.query) return posts;
      return posts.filter((post) => {
        const titleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
        const bodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());
        return titleMatch || bodyMatch
      })
    },
    comments(parent, args, ctx, info) {
      return comments;
    },
  },
  Mutation: {
    createUser(parent, args, ctx, info) {

      // .some() will iterate over users to find any user.email that matches args.email
      const emailTaken = users.some((user) => user.email === args.data.email);
      //validate email address uniqueness:
      if (emailTaken) throw new Error('Email taken')

      const user = {
        // define new user object
        id: uuidv4(), // use uuidv4 to create a random user id
        ...args.data
      }

      // adds new user object onto users array
      users.push(user);

      // returns new user
      return user
    },

    deleteUser(parent, args, ctx, info) {
      // find index will find the index for the user that's passed
      const userIndex = users.findIndex((user) => user.id === args.id);
      // when findIndex doesn't find an index for the user, it will default to (-1):
      if (userIndex === -1) throw new Error('user not found');
      // make sure we have an index for the user that get's passed in, then:

      // remove user from array
      const deletedUsers = users.splice(userIndex, 1)
      // use splice() to remove user with matching id, and only remove 1 user.


      // remove all associated posts

      posts = posts.filter((post) => {
        // use array.filer() to filter out any data associated with this user.
        const match = post.author === args.id;

        // when deleting a post that is a match, first remove all associated comments:
        if (match) return comments = comments.filter((comment) => comment.post !== post.id);
        // keep all comments that do not match the post id.

        // return false when we find a match - to filter out the matching post
        return !match
      });

      // remove all other comments associated to deleted user
      // if this user has comments on other user's posts, remove those comments as well:
      comments = comments.filter((comment) => comment.author !== args.id);

      // return first item in array of deletedUsers
      return deletedUsers[0];
    },

    createPost(parent, args, ctx, info) {

      // verify the user exists, if user id matches the id of the author.
      const userExists = users.some((user) => user.id === args.data.author);
      // exit if user not found.

      if (!userExists) throw new Error('User not found');
      // define new post from passed in values:

      const post = {
        id: uuidv4(),
        ...args.data
      }

      // add new post to posts array
      posts.push(post)

      // return new post
      return post
    },

    deletePost(parent, args, ctx, info) {
      // check if post exists
      const postIndex = posts.findIndex((post) => post.id === args.id)
      // throw error if post does not exist
      if (postIndex === -1) throw new Error('post not found')
      // remove the deleted post
      const deletedPosts = posts.splice(postIndex, 1);
      // remove all comments associated with the post.
      comments = comments.filter((comment) => comment.post !== args.id)

      // return first item off deletedPosts array
      return deletedPosts[0]
    },

    createComment(parent, args, ctx, info) {

      const userExists = users.some((user) => user.id === args.data.author);
      // post must exist and must be published:
      const postExists = posts.some((post) => post.id === args.data.post && post.published === true);

      if (!userExists) throw new Error('User not found');
      if (!postExists) throw new Error('post not found');

      const comment = {
        id: uuidv4(),
        ...args.data
      }
      comments.push(comment);
      return comment;
    },

    deleteComment(parent, args, ctx, info) {
      const commentsIndex = comments.findIndex((comment) => comment.id === args.id);
      if (commentsIndex === -1) throw new Error('comment does not exist');
      const deletedComments = comments.splice(commentsIndex, 1);
      return deletedComments[0];
    },
  },
  Post: {
    author(parent, args, ctx, info) {

      // we can iterate over each post object using the 'parent' argument: (parent = post);
      return users.find((user) => {

        // use find to iterate over the users, to match to our author id:
        return user.id === parent.author;

      });
    },
    comments(parent, args, ctx, info) {

      // we can iterate over each comment associated with the post: (parent: post)
      return comments.filter((comment) => {

        // filter any comments whose post value matches parent(post).id;
        return comment.post === parent.id;

      })
    }
  },
  User: {

    posts(parent, args, ctx, info) {

      // we can iterate over each post associated with this user: (parent: user)
      return posts.filter((post) => {

        // filter any posts whose author matches parent(user).id;
        return post.author === parent.id;

      })
    },

    comments(parent, args, ctx, info) {

      // we can iterate over each comment associated with the user: (parent: user)
      return comments.filter((comment) => {

        // filter any comments whose author matches parent(user).id;
        return comment.author === parent.id;

      })
    },

  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id = parent.author;
      })
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => {
        return post.id === parent.post
      })
    }
  }
};


const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start({ port: 4001 }, () => {
  console.log('served up')
});
