# Delete Data with Mutations

---------------------------------

When dealing with removing data from our database, we must keep in mind not to leave orphaned relationships to the data we're deleting for example. When a user gets removed, we may also want to remove their posts - otherwise we'll encounter some scenarios where we query for an author and that author no longer exists, because that user was removed.

Eventhough removing data from our applicaiton is a pretty simple process, it is important to be mindful of our data structure throughout the process.

Start by creating a new mutation for `deleteUser`

```js
deleteUser(id: ID!): User!
```



Once we have the mutation defined we can create the resolver to remove our user:

```js
deleteUser(parent, args, ctx, info) {

},
```

```js
    deleteUser(parent, args, ctx, info) {
      // find index will find the index for the user that's passed
      const userIndex = users.findIndex((user) => user.id === args.id;
      // when findIndex doesn't find an index for the user, it will default to (-1):
      if (userIndex === -1) throw new Error('user not found');
      // make sure we have an index for the user that get's passed in, then:

      // remove user from array
      const deletedUsers = users.splice(userIndex, 1)
      // use splice() to remove user with matching id, and only remove 1 user.


      // remove all associated posts
      // remove all associated comments


      // return array
      return deletedUsers[0];
    },
```

> `findIndex` works similarly to `find` but instead of returning the value, it will return the index of where the value is located.



Before we get too far, let's make sure at the least that we get a deletd user back, as we expect from our mtuation `typeDef` when we remove a user:

---------------------------------

> ```json
> mutation{
>   deleteUser(id: "1") {
>     id
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "deleteUser": {
>       "id": "1"
>     }
>   }
> }
> ```
>
> This actually works, but now we have posts and other associated content related to this user that we've deleted. This would keep us from running some queries where we are returning a results that has be deleted, and that would cause us to error out each time.



Made slight change to our dummy data set, using `let` vs `const`, bc we want to be able to update these items and remove from them, which let does for us out of the box.

```js
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
  post: '002'
}]
```





Now let's make sure we're removing all the posts and comments associated with any users that get deleted:

```js
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
```





Now when we run the deleteUser mutation, we should be able to successfully remove all posts and comments associated with that user, we'll first run a query for users and their associated posts and comments to verify the data later:

---------------------------------

> ```json
> query users{
>   users{
>     id
>     name
>     email
>     age
>     posts{
>       id
>       title
>     }
>     comments {
>       id
>     	text
>     }
>   }
> }
> ```
>
> ```json
>       {
>         "id": "1",
>         "name": "Jane",
>         "email": "info@infoesque.net",
>         "age": null,
>         "posts": [
>           {
>             "id": "001",
>             "title": "Post Title 1"
>           },
>           {
>             "id": "002",
>             "title": "Post Title 2"
>           }
>         ],
>         "comments": [
>           {
>             "id": "004",
>             "text": "comment for 4"
>           }
>         ]
>       },
> ```
>
> > since we're only removing user 1 we've simplified the fact that this is all the data that should be removed.



Now we can test our deleteUser mutation:

---------------------------------

> ```json
> mutation{
>   deleteUser(id: "1") {
>     id
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "deleteUser": {
>       "id": "1"
>     }
>   }
> }
> ```
>
> Now let's run our user query again and see what is in our database:
>
> ```json
> query users{
>   users{
>     id
>     name
>     email
>     age
>     posts{
>       id
>       title
>     }
>     comments {
>       id
>     	text
>     }
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "users": [
>       {
>         "id": "2",
>         "name": "John",
>         "email": "info2@infoesque.net",
>         "age": null,
>         "posts": [],
>         "comments": []
>       },
>       {
>         "id": "3",
>         "name": "Mike",
>         "email": "info3@infoesque.net",
>         "age": null,
>         "posts": [
>           {
>             "id": "003",
>             "title": "Post Title 3"
>           }
>         ],
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
> We have successfully removed all the data associated with user 1 and user 1 themselves from the database.





---------------------------------

Challenge: Create the mutation for deleting a post:

1. Define a mutation - takes in a post id, and should return the deleted post

   ```js
   deletePost(id: ID!): Post!
   ```

2. Define the resolver for the mutation

   ```js
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
   
   ```

   - Check if the post exists, else throw error 
   - remove and return the post
   - Remove all comments belonging to that post

3. Run Query (deletePost) - verify post/comments are removed.

---------------------------------

> ```json
> mutation {
>   deletePost(id: "001") {
>     id
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "deletePost": {
>       "id": "001"
>     }
>   }
> }
> ```
>
> 



---------------------------------

Challenge: create a deleteComment mutation

1. Define a mutation. It should the comment id. It should return the deleted comment.

   ```js
   deleteComment(id: ID!): Comment!
   ```

2. Define the resolver for the mutation

   ```js
   deleteComment(parent, args, ctx, info) {
     const commentsIndex = comments.findIndex((comment) => comment.id === args.id);
     if (commentsIndex === -1) throw new Error('comment does not exist');
     const deletedComments = comments.splice(commentsIndex, 1);
     return deletedComments[0];
   },
   ```

   - Check if the comment exists, else throw error
   - Remove and return the comment

   

3. Test mutation:

> ```json
> mutation {
>   deleteComment(id: "001") {
>     id
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "deleteComment": {
>       "id": "001"
>     }
>   }
> }
> ```

