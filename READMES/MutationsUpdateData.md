# Mutations: Update Data

---------------------------------

We'll still need to follow the same process, where when we want to add some new functionality we'll need to 

1. handle the typeDefs: `src/schema.graphql`

```js
updateUser(id: ID!, data: UpdateUserInput! ): User!
```

> Here we've passed in the `UpdateUserInput` for updating a user, these are the optional fields availabe for update, 
>
> ```js
> input UpdateUserInput {
>   name: String
>   email: String
>    age: Int
> }
> ```
>
> - We could've re-used the `CreateUserInput` with the only caveat being that we've required every field when we're creating a user, where as when updating, we may not need to update every field, and that's ok with graphQL, you can update only the data that's changed. 



2. Define the Mutation:

```js
    updateUser(parent, args, { db }, info) {
        const { id, data } = args
        const user = db.users.find((user) => user.id === id)

        if (!user) {
            throw new Error('User not found')
        }

        if (typeof data.email === 'string') {
            const emailTaken = db.users.some((user) => user.email === data.email)

            if (emailTaken) {
                throw new Error('Email taken')
            }

            user.email = data.email
        }

        if (typeof data.name === 'string') {
            user.name = data.name
        }

        if (typeof data.age !== 'undefined') {
            user.age = data.age
        }

        return user
    },
```



3. Test the Mutation in graphQL playground:

---------------------------------

> ```js
> mutation {
>   updateUser(id: "1" data: {name: "Phillip"}) {
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
>     "updateUser": {
>       "id": "1",
>       "name": "Phillip",
>       "email": "andrew@example.com",
>       "age": 27
>     }
>   }
> }
> ```
>
> We were successfully able to update the user's name.

> ```js
> mutation {
>   updateUser(id: "1" data: {email: "andrew@example.com"}) {
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
>   "data": null,
>   "errors": [
>     {
>       "message": "This email is known",
>       "locations": [
>         {
>           "line": 2,
>           "column": 3
>         }
>       ],
>       "path": [
>         "updateUser"
>       ]
>     }
>   ]
> }
> ```
>
> likely edge case where email is the same as the current user's email, 

> ```js
> mutation {
>   updateUser(id: "1" data: {name: "james", email: "gre@g.com", age: 20}) {
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
>     "updateUser": {
>       "id": "1",
>       "name": "james",
>       "email": "gre@g.com",
>       "age": 20
>     }
>   }
> }
> ```





---------------------------------

Challenge:  Setup Mutation for Updating a Post:

1. Define Mutation

   - Add id/data for arguments. Setup data to support title, body and published.
   - return updated post

   ```js
   updatePost(id: ID!, data: UpdatePostInput!): Post!
   ```

   ```js
   input UpdatePostInput {
       title: String
       body: String
       published: Boolean
   }
   ```

2. Create resolver method

   - Verify post exists, else throw error
   - update post properties one at a time

   ```js
     updatePost(parent, args, { db }, info) {
       const { id, data } = args
       const post = db.posts.find((post) => post.id === id);
       if (!post) throw new Error('post not found')
   
       if (data.title === 'string') post.title = data.title;
       if (data.body === 'string') post.body = data.body;
       if (data.published === 'boolean') post.published = data.published;
       return post
   
     },
   ```

3. test in graphql playground:

---------------------------------

> ```js
> mutation {
>   updatePost(id: "10", data: {title: "Blue Moon"}) {
>     id
>     title
>     body
>     published
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "updatePost": {
>       "id": "10",
>       "title": "GraphQL 101",
>       "body": "This is how to use GraphQL...",
>       "published": true
>     }
>   }
> }
> ```





---------------------------------

Challenge 2: Set up a mutation for updating a comment:

1. Define Mutation

   - Add id/data for arguments. Setup data to support text.
   - Return the updated comment

   ```js
   updateComment(id: ID! data: UpdateCommentInput!): Comment!
   ```

   ```js
   input UpdateCommentInput {
       text: String
   }
   ```

   

2. Create resolver method

   - Verify comment exists, else throw error
   - Update comment properties one at a time.

   ```js
     updateComment(parent, args, { db }, info) {
       const comment = db.comments.find((comment) => comment.id === args.id);
       if (!comment) throw new Error('No matching comment found');
   
       if (args.text) comment.text = args.text;
   
       return comment;
     }
   ```

3. Verify your work by updating all properties for a given comment.

   ---------------------------------

   > ```js
   > mutation{
   >   updateComment(id: "102", data: {text: "this is the updated text"}) {
   >     id
   >     text
   >   }
   > }
   > ```
   >
   > ```json
   > {
   >   "data": {
   >     "updateComment": {
   >       "id": "102",
   >       "text": "this is the updated text"
   >     }
   >   }
   > }
   > ```