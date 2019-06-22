The goal of these challenges is going to be to setup a new Comments type and establish its relationship between users and posts.

<u>Part 1</u>

1. Set up  a "Comment" type with an id and text fields. Both non-nullable(`!`)

   ```js
   type Comment {
     id: ID!
     text: String!
   }
   ```

2. Set up a 'comments' dummy data array with 4 comments 

   ```js
   const comments = [{
     id: '001',
     text: 'comment for 1'
   }, {
     id: '002',
     text: 'comment for 2'
   }, {
     id: '003',
     text: 'comment for 3'
   }, {
     id: '004',
     text: 'comment for 4'
   }]
   ```

3. Set up a 'comments' query 

   ```js
   comments: [Comment!]
   ```

   3b. with a resolver that returns all the comments.

   ```js
   comments(parent, args, ctx, info) {
     return comments;
   },
   ```

   

4. Run a query to get all 4 comments with both id and text fields

   > ---------------------------------
   >
   > ```json
   > query comments {
   >   comments{
   >     id
   >     text
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
   >         "text": "comment for 1"
   >       },
   >       {
   >         "id": "002",
   >         "text": "comment for 2"
   >       },
   >       {
   >         "id": "003",
   >         "text": "comment for 3"
   >       },
   >       {
   >         "id": "004",
   >         "text": "comment for 4"
   >       }
   >     ]
   >   }
   > }
   > ```



---------------------------------

<u>Part 2</u>

We'll work to establish the relatinship between a `Comment` and a `User`:

1. Set up an author field on Comment

   ```js
     type Comment {
       id: ID!
       text: String!
       author: User!
     }
   ```

2. update all comments in the array to have an author field (use one of the user ids as a value)

   ```js
   const comments = [{
     id: '001',
     text: 'comment for 1',
     author: '2'
   }, {
     id: '002',
     text: 'comment for 2',
     author: '3'
   }, {
     id: '003',
     text: 'comment for 3',
     author: '3'
   }, {
     id: '004',
     text: 'comment for 4',
     author: '1'
   }]
   ```

3. Create a resolver for the Comments author field that returns the user who wrote the comment

   ```js
   Comment: {
     author(parent, args, ctx, info) {
       return users.find((user) => {
         return user.id = parent.author;
       })
     }
   }
   ```

4. Run a sample query that gets all comments and gets the authors name

   > ---------------------------------
   >
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
   >       }
   >     ]
   >   }
   > }
   > ```
   >
   > 

   

5. Set up a comments field on User

   ```js
   comments: [Comment!]!
   ```

6. Set up a resolver for the user comments field that returns all comments belonging to that user

   ```js
   comments(parent, args, ctx, info) {
     // we can iterate over each comment associated with the user: (parent: user)
     return comments.filter((comment) => {
       // filter any comments whose author matches parent(user).id;
       return comment.author === parent.id;
     })
   },
   ```

7. Run a sample query that gets all users and their comments.

   ---------------------------------

   

   > ```json
   > query users{
   >   users{
   >     id
   >     name
   >     email
   >     age
   >     comments {
   >       id
   >     	text
   >     }
   >   }
   > }
   > 
   > ```
   >
   > ```json
   > {
   >   "data": {
   >     "users": [
   >       {
   >         "id": "1",
   >         "name": "Jane",
   >         "email": "info@infoesque.net",
   >         "age": null,
   >         "comments": [
   >           {
   >             "id": "004",
   >             "text": "comment for 4"
   >           }
   >         ]
   >       },
   >       {
   >         "id": "2",
   >         "name": "John",
   >         "email": "info2@infoesque.net",
   >         "age": null,
   >         "comments": [
   >           {
   >             "id": "001",
   >             "text": "comment for 1"
   >           }
   >         ]
   >       },
   >       {
   >         "id": "3",
   >         "name": "Mike",
   >         "email": "info3@infoesque.net",
   >         "age": null,
   >         "comments": [
   >           {
   >             "id": "002",
   >             "text": "comment for 2"
   >           },
   >           {
   >             "id": "003",
   >             "text": "comment for 3"
   >           }
   >         ]
   >       }
   >     ]
   >   }
   > }
   > ```
   >
   > 



---------------------------------

<u>Part 3</u>

In this section we'll be associating our posts with comments that belong to them.

1. Set up a post field on Comment

   ```js
   post: Post!
   ```

2. Update all comments in the array to have a new post field (use of the the post ids as a value)

   ```js
   const comments = [{
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
     post: '002'
   }]
   ```

3. Create a resolver for the Comments post field that returns the post that the comment belongs to

   ```js
   post(parent, args, ctx, info) {
     return posts.find((post) => {
       return post.id === parent.post
     })
   }
   ```

4. Run a sample Query that gets all comments and the post name

   ---------------------------------

   > ```json
   > query {
   >   comments{
   >   	id
   >     post{
   >       title
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
   >         "post": {
   >           "title": "Post Title 1"
   >         }
   >       },
   >       {
   >         "id": "002",
   >         "post": {
   >           "title": "Post Title 3"
   >         }
   >       },
   >       {
   >         "id": "003",
   >         "post": {
   >           "title": "Post Title 1"
   >         }
   >       },
   >       {
   >         "id": "004",
   >         "post": {
   >           "title": "Post Title 2"
   >         }
   >       }
   >     ]
   >   }
   > }
   > ```

5. Set up a comments field on Post

   ```js
   comments: [Comment!]!
   ```

6. Set up a resolver for the Post comments field that returns all comments belonging to the post.

   ```js
   comments(parent, args, ctx, info) {
     // we can iterate over each comment associated with the post: (parent: post)
     return comments.filter((comment) => {
       // filter any comments whose post value matches parent(post).id;
       return comment.post === parent.id;
     })
   }
   ```

7. Run a sample query that gets all posts and all their comments

   ---------------------------------

   > ```json
   > query {
   >   posts{
   >     id
   >     title
   >     comments{
   >       id
   >       text
   >     }
   >   }
   > }
   > ```
   >
   > ```json
   > {
   >   "data": {
   >     "posts": [
   >       {
   >         "id": "001",
   >         "title": "Post Title 1",
   >         "comments": [
   >           {
   >             "id": "001",
   >             "text": "comment for 1"
   >           },
   >           {
   >             "id": "003",
   >             "text": "comment for 3"
   >           }
   >         ]
   >       },
   >       {
   >         "id": "002",
   >         "title": "Post Title 2",
   >         "comments": [
   >           {
   >             "id": "004",
   >             "text": "comment for 4"
   >           }
   >         ]
   >       },
   >       {
   >         "id": "003",
   >         "title": "Post Title 3",
   >         "comments": [
   >           {
   >             "id": "002",
   >             "text": "comment for 2"
   >           }
   >         ]
   >       }
   >     ]
   >   }
   > }
   > ```
   >
   > 