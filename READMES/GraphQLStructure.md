---
group: graph-basics
published: true
---

# GraphQL File Structure

---------------------------------

Our goal will be to break up our single file application, into a more realworld file structure typically utilized with graphQL. 

1. Extract `typeDefs` into their own file: `/schema.graphql`

   ```js
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
   ```



2. We'll need to update our server, and point to the `schema.graphql` file we just created, instead of the `typeDefs` that were locally defined here previously. 

  ```js
  const server = new GraphQLServer({
    // typeDefs,
    typeDefs: './src/schema.graphql',
    resolvers
  });
  ```
  
  
  
3. update nodemon script in `package.json` to include watching for files with the `.graphql` extension:

   ```json
   "start": "nodemon src/index.js -ext js,graphql --exec babel-node",
   
   ```

   > `-ext js,graphql` - tells nodemon to watch for the extensions `js & graphql` this will allow nodemon to automatically refresh the server when our `schema.graphql` file is updated.

   

4. Extract our dummy data into a separate file: `src/db.json`:

   ```js
   // Demo user data
   const users = [
     {
       id: '1',
       name: 'Jane',
       email: 'info@infoesque.net'
     },
     {
       id: '2',
       name: 'John',
       email: 'info2@infoesque.net'
     },
     {
       id: '3',
       name: 'Mike',
       email: 'info3@infoesque.net'
     }
   ]
   
   const posts = [
     {
       id: '001',
       title: 'Post Title 1',
       body: 'Some Lorem for post 1',
       published: true,
       author: '1'
     },
     {
       id: '002',
       title: 'Post Title 2',
       body: 'Some Lorem for post 2',
       published: true,
       author: '1'
     },
     {
       id: '003',
       title: 'Post Title 3',
       body: 'Some Lorem for post 3',
       published: false,
       author: '3'
     }
   ]
   
   const comments = [
     {
       id: '001',
       text: 'comment for 1',
       author: '2',
       post: '001'
     },
     {
       id: '002',
       text: 'comment for 2',
       author: '3',
       post: '003'
     },
     {
       id: '003',
       text: 'comment for 3',
       author: '3',
       post: '001'
     },
     {
       id: '004',
       text: 'comment for 4',
       author: '1',
       post: '003'
     }
   ]
   ```

   > **NOTE**: we've replaced `let` w/  `const` because will no longer need to be able to change this data.

   

   > now we can houses all of our demo data in a single variable:
   >
   > ```js
   > const db = {
   >   users,
   >   posts,
   >   comments
   > }
   > ```

   > now we are able to export a single variable for our entire database:
   >
   > ```js
   > export {db as default}
   > ```



now that we've pulled out our `data` and our `typeDefs` we'll eventually be pulling out our mutations and our queries as well, and this raises the issue that we are facing, how do we now refernce our data from our mutations and our queries now that they are all in separate files. 

This is where the context from our resolvers comes into play: `ctx`:

```js
... (parents, args, `ctx`, info) {/* ... */ }
```

The context is just an object with a set of properties, which we can define. This context that we define then becomes available via the `ctx` argument in every resolver.

What we will do is setup our newly defined `db` object to be referenced by `ctx`, we can do this by updating our yoga server configuration: `src/index.js`

first import db into `src/index.js`

```js
import db from './db'
```

now we can pass this `db` object into the context via our `graphQL yoga server`:

```js
const server = new GraphQLServer({
  // typeDefs,
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    db // setting database to context.
  }
});
```

---------------------------------

we'll be replacing all of the refences to users, posts, or comments to reflect their location in context:  

> original users query:
>
> ```js
> users(parent, args, ctx, info) {
>   if (!args.query) return users;
>   return users.filter((user) => {
>     return user.name.toLowerCase().includes(args.query.toLowerCase());
>   })
> },
> ```

> users query referencing `ctx`:
>
> ```js
> users(parent, args, ctx, info) {
>   if (!args.query) return ctx.db.users;
>   return ctx.db.users.filter((user) => {
>     return user.name.toLowerCase().includes(args.query.toLowerCase());
>   })
> },
> ```
>
> > `users = ctx.db.users`
>
> We can actually shorten this a bit further by desctructing `db` from `ctx`:
>
> ```js
> users(parent, args, { db }, info) {
>   if (!args.query) return db.users;
>   return db.users.filter((user) => {
>     return user.name.toLowerCase().includes(args.query.toLowerCase());
>   })
> },
> ```
>
> > Now: `ctx.db.users = db.users`

We're going to do this for the rest of the `Queries`:

```js
posts(parent, args, { db }, info) {
  if (!args.query) return db.posts;
  return db.posts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
    const bodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());
    return titleMatch || bodyMatch
  })
},
```

```js
comments(parent, args, { db }, info) {
  return db.comments;
},
```

---------------------------------

`Mutations`:

```js
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
```

```js
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
```

```js
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
```

```js
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
```

```js
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
```

```js
deleteComment(parent, args, { db }, info) {
  const commentsIndex = db.comments.findIndex((comment) => comment.id === args.id);
  if (commentsIndex === -1) throw new Error('comment does not exist');
  const deletedComments = db.comments.splice(commentsIndex, 1);
  return deletedComments[0];
},
```

---------------------------------

`Post`:

```js
author(parent, args, { db }, info) {

  // we can iterate over each post object using the 'parent' argument: (parent = post);
  return db.users.find((user) => {

    // use find to iterate over the users, to match to our author id:
    return user.id === parent.author;

  });
},
```

```js
comments(parent, args, {db}, info) {

  // we can iterate over each comment associated with the post: (parent: post)
  return db.comments.filter((comment) => {

    // filter any comments whose post value matches parent(post).id;
    return comment.post === parent.id;

  })
}
```

---------------------------------

`User`:

```js
posts(parent, args, { db }, info) {

  // we can iterate over each post associated with this user: (parent: user)
  return db.posts.filter((post) => {

    // filter any posts whose author matches parent(user).id;
    return post.author === parent.id;

  })
},
```

```js
comments(parent, args, { db }, info) {

  // we can iterate over each comment associated with the user: (parent: user)
  return db.comments.filter((comment) => {

    // filter any comments whose author matches parent(user).id;
    return comment.author === parent.id;
  })
},
```

---------------------------------

`Comment`:

```js
author(parent, args, { db }, info) {
  return db.users.find((user) => {
    return user.id = parent.author;
  })
},
```

```js
post(parent, args, { db }, info) {
  return db.posts.find((post) => {
    return post.id === parent.post
  })
}
```





