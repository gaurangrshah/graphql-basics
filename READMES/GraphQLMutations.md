---
group: graph-basics
published: true
---

# Mutations in GraphQL

---------------------------------

In graphQL we use queries to fetch and retrieve data, whereas mutations are used to Create, Update and Delete our data. Completing the CRUD circle.

Mutations get defined in the `typeDefs` object just like our queries.

```js
const typeDefs = `
	type Query {
    users(query: String): [User!]
    me: User!
    post: Post!
    posts(query: String): [Post!]
    comments: [Comment!]
  }

  type Mutation {
    
  }

/* ... */

}`;
```





## Creating Data

---------------------------------

Now let's create a `createUser` mutation:

```js
  type Mutation {
    createUser(name: String!, email: String!, age: Int): User!
  }
```

> `createUser` takes 3 arguments, `name` and `email` are both `non-nullable`(`!`), while age is optional. createUser will <u>always return</u> (`!`) the User that was created.

Next we need to create a resolver function for our `createUser` mutation:

```js
const resolvers = {
  Mutation: {

  },
  /*...*/
}
```



Next we can access the information passed into our mutation via the args argument, in order to handle our `createUser` mutation:

```js
  Mutation: {
    createUser(parent, args, ctx, info) {
      console.log(args);
    }
  },
```

> Normally before adding data to our database, we'll want to validate the data, things like: 
>
> - ensuring the email is unique (isn't already registered).
> - user has entered a valid name
> - etc… based on use cases.
>
> 
>
> for now we've logged the args to the console:
>
> ```json
> mutation {
>   createUser(name: "G", email: "g@gmail.com", age: 30){
>     id
>     name
>     email
>     age
>   }
> }
> ```
>
> our mutation fails because we do not have the user persisting, but we are able to see the results of our query in the log:
>
> ```json
> { name: 'G', email: 'g@gmail.com', age: 30 }
> ```

You'll notice that we didn't get an id back, for our new user, and that is because we haven't told graphQL how we want it to assign our ids for us, to do this we'll be using a library called: `uuid`

```shell
npm i uuid@3.3.2
```

The UUID library comes with 5 different versions we can use v1-5, each version offers a different method of creating timestamps so we can choose the one that best fits our needs. We'll be using v4 in this project which generates completely random UUIDs.

To use UUID:

```js
import uuidv4 from 'uuid/v4';
// version 4 of uuid - generates completely random ids.
```



Now we can use UUID's library to allow graphQL to generate unique ids for us when a new user is created.

```js
  Mutation: {
    createUser(parent, args, ctx, info) {
      console.log(args);
      // .some() will iterate over users to find any user.email that matches args.email
      const emailTaken = users.some((user) => user.email === args.email);
      //validate email address uniqueness:
      if (emailTaken) throw new Error('Email taken.')
      const user = {
        // define new user object
        id: uuidv4(), // use uuidv4 to create a random user id
        name: args.name,
        email: args.email,
        age: args.age
      }

      users.push(user);
      return user
    }
  },
```

> **NOTE**: `.some()` - returns a list of matches, that meet a condition.

---------------------------------

> Now if we run the same query:
>
> ```json
> mutation {
> createUser(name: "G", email: "g@gmail.com", age: 30){
>  id
>  name
>  email
>  age
> }
> }
> ```
>
> ```json
> {
> "data": {
>  "createUser": {
>    "id": "efffec6c-3b66-4df5-b1f1-02ed63480642",
>    "name": "G",
>    "email": "g@gmail.com",
>    "age": 30
>  }
> }
> }
> ```
>
> we are successfully able to create a new user.
>
> **NOTE**: if we were to run this same mutation again we'd get an error:
>
> ```json
> {
>   "data": null,
>   "errors": [
>     {
>       "message": "Email taken",
>       "locations": [
>         {
>           "line": 2,
>           "column": 3
>         }
>       ],
>       "path": [
>         "createUser"
>       ]
>     }
>   ]
> }
> ```

It's important to note our data is currently not persisting, so once we refresh or save our document again, all of our available data well be reset.

 

Next we'll create a `createPost` mutation. 

First step is to define the mutation in our `typeDefs` along with our `createUser` mutation:

```js
createPost(): Post!
```

> `createPost` will always return a new `Post`, 

next we should figure out what fields does `createPost` need in order to create a new `Post`:

```js
createPost(title: String!, body: String!, published: Boolean!, author: ID! ): Post!
```

> `createPost` must take in a string for the body and title, a boolean for published and an ID for the author. 



Next we can setup the resolver method for `createPost`:

```js
    createPost(parent, args, ctx, info) {
      // verify the user exists, if user id matches the id of the author.
      const userExists = users.some((user) => user.id === args.author);
      // error if user not found.
      if (!userExists) throw new Error('User not found');
      // define new post from passed in values:
      const post = {
        id: uuidv4(),
        title: args.title,
        body: args.body,
        published: args.published,
        author: args.author
      }
      // add new post to posts array
      posts.push(post)
      // return new post
      return post
    },
```



Before we test our query, we'll need to ensure we have atleast one user in our database:

---------------------------------

> Add new user mutation:
>
> ```json
> mutation {
>   createUser(name: "G", email: "g@gmail.com", age: 30){
>     id
>     name
>     email
>     age
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "createUser": {
>       "id": "1c654f1d-e49b-4966-92e4-dd42dc59935d",
>       "name": "G",
>       "email": "g@gmail.com",
>       "age": 30
>     }
>   }
> }
> ```
>
> Now we can use the id for this user, to create a new post:
>
> ```json
> mutation {
>   createPost(title:"new post", body: "lorem for new post", published:true, author: "1c654f1d-e49b-4966-92e4-dd42dc59935d") {
>     id
>     title
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "createPost": {
>       "id": "60fe4d54-3614-4e7a-959d-32122a97ac2c",
>       "title": "new post"
>     }
>   }
> }
> ```
>
> We can can actually query as much data as we need when we work with nested relational mutations:
>
> ```js
> mutation {
>   createPost(title:"new post1", body: "lorem for new post1", published:false, author: "1c654f1d-e49b-4966-92e4-dd42dc59935d") {
>     id
>     title
>     body
>     published
>     author{
>       name
>     }
>     comments {
>       id
>     }
>   }
> }
> 
> ```
>
> ```json
> {
>   "data": {
>     "createPost": {
>       "id": "16ca4c9f-ee12-4a3a-b501-13855f20ed69",
>       "title": "new post1",
>       "body": "lorem for new post1",
>       "published": false,
>       "author": {
>         "name": "G"
>       },
>       "comments": []
>     }
>   }
> }
> ```



> Now that we've created a post, we should be able to use the posts query and query for this new post:
>
> ```json
> query {
>   posts{
>     id
>     title
>     author{
>       name
>     }
>   }
> }
> ```
>
> and we get back and array of posts, containing the two new posts we just added:
>
> ```js
> {
>   "data": {
>     "posts": [
>       {
>         "id": "001",
>         "title": "Post Title 1",
>         "author": {
>           "name": "Jane"
>         }
>       },
>       {
>         "id": "002",
>         "title": "Post Title 2",
>         "author": {
>           "name": "Jane"
>         }
>       },
>       {
>         "id": "003",
>         "title": "Post Title 3",
>         "author": {
>           "name": "Mike"
>         }
>       },
>       {
>         "id": "60fe4d54-3614-4e7a-959d-32122a97ac2c",
>         "title": "new post",
>         "author": {
>           "name": "G"
>         }
>       },
>       {
>         "id": "16ca4c9f-ee12-4a3a-b501-13855f20ed69",
>         "title": "new post1",
>         "author": {
>           "name": "G"
>         }
>       }
>     ]
>   }
> }
> ```
>
> 

---------------------------------



Challenge:

1. Define a new `createComment` mutation

   - should take text, author and post
   - should return a comment

   ```js
   createComment(text: $String!, author: $String!, post: $String!): Comment!
   ```

2. Define a resolver method for createComment

   - confirm that the user exists, else throw error
   - confirm that the posts exists and is published, else throw error
   - if they do exist, create the comment and return it

   ```js
   createComment(parent, args, ctx, info) {
     const userExists = users.some((user) => user.id === args.author);
     // post must exist and must be published:
     const postExists = posts.some((post) => post.id === args.post && post.published === true);
     if (!userExists) throw new Error('User not found');
     if (!postExists) throw new Error('post not found');
   
     const comment = {
       id: uuidv4(),
       text: args.text,
       author: args.author,
       post: args.post
     }
     comments.push(comment);
     return comment;
   }
   ```

   

3. Run the mutation to add a comment

   ---------------------------------

   > ```json
   > mutation {
   >   createComment(text:"first comment", author: "3", post: "001") {
   >     id
   >     text
   >   }
   > }
   > ```
   >
   > ```json
   > {
   >   "data": {
   >     "createComment": {
   >       "id": "96c7b2d9-1231-4d7c-a523-85022e14a32b",
   >       "text": "first comment"
   >     }
   >   }
   > }
   > ```
   >
   > and if we were to pass in a post that doesn't exist:
   >
   > ```json
   > {
   >   "data": null,
   >   "errors": [
   >     {
   >       "message": "post not found",
   >       "locations": [
   >         {
   >           "line": 2,
   >           "column": 3
   >         }
   >       ],
   >       "path": [
   >         "createComment"
   >       ]
   >     }
   >   ]
   > }
   > ```
   >
   > > We get back the error that we throw

   

4. use the comments query to verify the comment was added.

   ---------------------------------

> ```json
> query comments {
>   comments{
>     id
>     text
>     author {
>       name
>     }
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "comments": [
>       {
>         "id": "001",
>         "text": "comment for 1",
>         "author": {
>           "name": "Jane"
>         }
>       },
>       {
>         "id": "002",
>         "text": "comment for 2",
>         "author": {
>           "name": "Jane"
>         }
>       },
>       {
>         "id": "003",
>         "text": "comment for 3",
>         "author": {
>           "name": "Jane"
>         }
>       },
>       {
>         "id": "004",
>         "text": "comment for 4",
>         "author": {
>           "name": "Jane"
>         }
>       },
>       {
>         "id": "22f38c67-8511-4ed5-9ff4-6f1249df58de",
>         "text": "first comment",
>         "author": {
>           "name": "Jane"
>         }
>       },
>       {
>         "id": "2b849f2d-b4ff-4cf6-b5db-9e6a5cf842f3",
>         "text": "first comment",
>         "author": {
>           "name": "Jane"
>         }
>       }
>     ]
>   }
> }
> ```
>
> 
