---
group: graph-basics
published: true
---

# GraphQL File Structure pt. 2

---------------------------------

Here we can take a look at how we can go about refactoring the resolvers we've created: create new folder structure for our resolvers: `src/resolvers`. 

> this folder will also house our resolvers for our Mutations, Query, Post, Comment, User, etc.

Let's start by refactoring our Query items to `src/resolvers/Query.js`

```js
const Query = {
  users(parent, args, { db }, info) {
    if (!args.query) return db.users;
    return db.users.filter((user) => {
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
  posts(parent, args, { db }, info) {
    if (!args.query) return db.posts;
    return db.posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
      const bodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());
      return titleMatch || bodyMatch
    })
  },
  comments(parent, args, { db }, info) {
    return db.comments;
  },
}

export default Query;
```



Next refactor `src/resolvers/Mutation.js`:

```js
import uuidv4 from 'uuid/v4';
// version 4 of uuid - generates completely random ids.

const Mutation = {
  createUser(parent, args, { db }, info) {

    // .some() will iterate over ctx.db.users to find any user.email that matches args.email
    const emailTaken = db.users.some((user) => user.email === args.data.email);
    //validate email address uniqueness:
    if (emailTaken) throw new Error('Email taken')

    const user = {
      // define new user object
      id: uuidv4(), // use uuidv4 to create a random user id
      ...args.data
    }

    // adds new user object onto users array
    db.users.push(user);

    // returns new user
    return user
  },

  deleteUser(parent, args, { db }, info) {
    // find index will find the index for the user that's passed
    const userIndex = db.users.findIndex((user) => user.id === args.id);
    // when findIndex doesn't find an index for the user, it will default to (-1):
    if (userIndex === -1) throw new Error('user not found');
    // make sure we have an index for the user that get's passed in, then:

    // remove user from array
    const deletedUsers = db.users.splice(userIndex, 1)
    // use splice() to remove user with matching id, and only remove 1 user.


    // remove all associated posts

    db.posts = db.posts.filter((post) => {
      // use array.filer() to filter out any data associated with this user.
      const match = post.author === args.id;

      // when deleting a post that is a match, first remove all associated comments:
      if (match) return db.comments = db.comments.filter((comment) => comment.post !== post.id);
      // keep all comments that do not match the post id.

      // return false when we find a match - to filter out the matching post
      return !match
    });

    // remove all other comments associated to deleted user
    // if this user has comments on other user's posts, remove those comments as well:
    db.comments = db.comments.filter((comment) => comment.author !== args.id);

    // return first item in array of deletedUsers
    return deletedUsers[0];
  },

  createPost(parent, args, { db }, info) {

    // verify the user exists, if user id matches the id of the author.
    const userExists = db.users.some((user) => user.id === args.data.author);
    // exit if user not found.

    if (!userExists) throw new Error('User not found');
    // define new post from passed in values:

    const post = {
      id: uuidv4(),
      ...args.data
    }

    // add new post to posts array
    db.posts.push(post)

    // return new post
    return post
  },

  deletePost(parent, args, { db }, info) {
    // check if post exists
    const postIndex = db.posts.findIndex((post) => post.id === args.id)
    // throw error if post does not exist
    if (postIndex === -1) throw new Error('post not found')
    // remove the deleted post
    const deletedPosts = db.posts.splice(postIndex, 1);
    // remove all comments associated with the post.
    db.comments = db.comments.filter((comment) => comment.post !== args.id)

    // return first item off deletedPosts array
    return deletedPosts[0]
  },

  createComment(parent, args, { db }, info) {

    const userExists = db.users.some((user) => user.id === args.data.author);
    // post must exist and must be published:
    const postExists = db.posts.some((post) => post.id === args.data.post && post.published === true);

    if (!userExists) throw new Error('User not found');
    if (!postExists) throw new Error('post not found');

    const comment = {
      id: uuidv4(),
      ...args.data
    }
    db.comments.push(comment);
    return comment;
  },

  deleteComment(parent, args, { db }, info) {
    const commentsIndex = db.comments.findIndex((comment) => comment.id === args.id);
    if (commentsIndex === -1) throw new Error('comment does not exist');
    const deletedComments = db.comments.splice(commentsIndex, 1);
    return deletedComments[0];
  },
}

export default Mutation
```

> ==We'll need to ensure we're importing `uuidv4` for our mutations== 



Finally we can refactor our Post, User & Comment - each to their own respective file in `src/resolvers/`

```js
const User = {

  posts(parent, args, { db }, info) {

    // we can iterate over each post associated with this user: (parent: user)
    return db.posts.filter((post) => {

      // filter any posts whose author matches parent(user).id;
      return post.author === parent.id;

    })
  },

  comments(parent, args, { db }, info) {

    // we can iterate over each comment associated with the user: (parent: user)
    return db.comments.filter((comment) => {

      // filter any comments whose author matches parent(user).id;
      return comment.author === parent.id;

    })
  },

}

export default User;
```



```js
const Comment = {
  author(parent, args, { db }, info) {
    return db.users.find((user) => {
      return user.id = parent.author;
    })
  },
  post(parent, args, { db }, info) {
    return db.posts.find((post) => {
      return post.id === parent.post
    })
  }
}

export default Comment
```



```js
const Post = {
  author(parent, args, { db }, info) {

    // we can iterate over each post object using the 'parent' argument: (parent = post);
    return db.users.find((user) => {

      // use find to iterate over the users, to match to our author id:
      return user.id === parent.author;

    });
  },
  comments(parent, args, { db }, info) {

    // we can iterate over each comment associated with the post: (parent: post)
    return db.comments.filter((comment) => {

      // filter any comments whose post value matches parent(post).id;
      return comment.post === parent.id;

    })
  }
}

export default Post;
```



Next we'll want to make sure we're importing all the files we've just refactored out, back into `src/index.js`:

```js
import { GraphQLServer } from 'graphql-yoga';
// GraphQLServer allows us to create a graphql server using the yoga library.

import Query from './resolvers/Query'
import Mutation from './resolvers/Mutation'
import Post from './resolvers/Post';
import Comment from './resolvers/Comment';
import User from './resolvers/User';
import db from './db';


const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
	// resolvers,
  resolvers: {
    Query,
    Mutation,
    User,
    Post,
    Comment
  },
  context: {
    db // setting database to context.
  }
});

server.start({ port: 4001 }, () => {
  console.log('served up')
});

```



We've imported back all of the files we refactored out, but in doing so, we've now made index.js responsible for only its core functionality which is to bootstrap our application. We're no longer defining things in this file or handling any application logic here either. 

