---
group: graph-basics
published: true
---

# Subscriptions: Comments

---------------------------------

Goal: setup up a subscription that allows rendering a list of comments to the client:

---------------------------------

`src/schema.graphql`

```js
comment(postId: ID!): Comment!
```

setup resolver for comment subscription: `src/resolvers/Subscription.js`:

```js
  comment: {

    subscribe(parent, args, ctx, info) {
      // 1. check if post exists & is published

      // 2. return asyncIterator subscribed to a channelName:
    }
  },
```



```js
  comment: {
    subscribe(parent, { postId }, { db, pubsub }, info) {
      // 1. check if post exists & is published
      const post = db.post.find((post) => post.id === postId && post.published)
      if (!post) throw new Error('no post found');

      // 2. return asyncIterator subscribed to a channelName:
      return pubsub.asyncIterator(`comment ${postId}`)
      // using template strings to dynamically inject postId into channelName
    }
  },
```



Next we'll want to call pubsub.publish for our comment, and the best place to do that from is where we are creating the comments themselves from `src/resolvers/Mutation.js`:

```js
  createComment(parent, args, { db, pubsub }, info) {
    // destructure pubsub along with db to use for publishing comment:

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
    pubsub.publish(`comment ${args.data.post}`, {
      // dynamically passing in postId as args.data.post for the channelName
      comment
      // the value of the comment variable from above gets passed in as the 2nd arg.
    })
    return comment;
  },
```



With this setup we can now start listening for our comment subscription via the playground:

---------------------------------

> ```js
> subscription{
> 	comment(postId: "10") {
>     id
>     text
>     author{
>       id
>     }
>   }
> }
> 
> ```
>
> Once we run this subscription it will start listening, and that's when we can add new comments and see the subcription in action:`
>
> ```json
> {
>   "data": {
>     "comment": {
>       "id": "505c3979-1777-4d17-9a65-96fbcb82dab8",
>       "text": "comment1",
>       "author": {
>         "id": "2"
>       }
>     }
>   }
> }
> ```
>
> > New comment created gets ouput to the playground when updates occur.



---------------------------------

Challenge: Setup CREATED, UPDATED< and DELETED for comment subscription:

1. Set up a custom payload type for the comment subscription `src/schema.graphql`

   ```js
   type CommentSubscriptionPayload {
       mutation: String!
       data: Comment!
   }
   ```

   ```js
   type Subscription {
       comment(postId: ID!): CommentSubscriptionPayload!
       post: PostSubscriptionPayload!
   }
   ```

2. update publish call in createComment to send back CREATED with the data

   ```js
   pubsub.publish(`comment ${args.data.post}`, {
     // dynamically passing in postId as args.data.post for the channelName
     comment: {
       mutation: 'CREATED',
       data: comment,
     }
   })
   ```

3. Add publish call in the deleteComment using DELETED event

   ```js
     deleteComment(parent, args, { db, pubsub }, info) {
       const commentsIndex = db.comments.findIndex((comment) => comment.id === args.id);
       if (commentsIndex === -1) throw new Error('comment does not exist');
   
       const [deletedComment] = db.comments.splice(commentsIndex, 1);
       pubsub.publish(`comment ${deletedComment.post}`, {
         comment: {
           mutation: 'DELETED',
           data: deletedComment,
         }
       })
   
       return deletedComment;
     },
   
   ```

   

4. Add publish call in updateComment using UPDATED event

```js
  updateComment(parent, args, { db, pubsub }, info) {
    const comment = db.comments.find((comment) => comment.id === args.id);
    if (!comment) throw new Error('No matching comment found');

    if (args.data.text) { comment.text = args.data.text; }
    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: 'UPDATED',
        data: comment,
      }
    })

    return comment;
  },
```





5. Test the subscription:

   ---------------------------------

>run the comments subscription:
>
>```j
>subscription comment{
>	comment(postId: "10") {
>		mutation
>    data{
>      id
>      text
>      author {
>        id
>        name
>      }
>    }
>  }
>}
>```
>
>Create a Comment: 
>
>```js
>mutation createComment{
>  createComment(data:{text:"comment1", author: "2", post: "10"}){
>		id
>    text
>  }
>}
>```
>
>```json
>{
>  "data": {
>    "createComment": {
>      "id": "e5c2d963-c081-4c97-8eb3-388d279dcd36",
>      "text": "comment1"
>    }
>  }
>}
>```
>
>subscription output:
>
>```js
>{
>  "data": {
>    "comment": {
>      "mutation": "CREATED",
>      "data": {
>        "id": "e5c2d963-c081-4c97-8eb3-388d279dcd36",
>        "text": "comment1",
>        "author": {
>          "id": "2",
>          "name": "Sarah"
>        }
>      }
>    }
>  }
>}
>```
>
>
>
>
>
>Update a comment:
>
>```js
>mutation updateComment{
>  updateComment(id: "e5c2d963-c081-4c97-8eb3-388d279dcd36", data: {text: "this is the updated text"}) {
>    id
>    text
>  }
>}
>```
>
>```js
>{
>  "data": {
>    "updateComment": {
>      "id": "e5c2d963-c081-4c97-8eb3-388d279dcd36",
>      "text": "this is the updated text"
>    }
>  }
>}
>```
>
>```js
>{
>  "data": {
>    "comment": {
>      "mutation": "UPDATED",
>      "data": {
>        "id": "e5c2d963-c081-4c97-8eb3-388d279dcd36",
>        "text": "this is the updated text",
>        "author": {
>          "id": "2",
>          "name": "Sarah"
>        }
>      }
>    }
>  }
>}
>```
>
>
>
>
>
>Delete a comment:
>
>```js
>mutation deleteComment{
>  deleteComment(id: "e5c2d963-c081-4c97-8eb3-388d279dcd36") {
>    id
>  }
>}
>```
>
>```js
>{
>  "data": {
>    "deleteComment": {
>      "id": "e5c2d963-c081-4c97-8eb3-388d279dcd36"
>    }
>  }
>}
>```
>
>```js
>{
>  "data": {
>    "comment": {
>      "mutation": "DELETED",
>      "data": {
>        "id": "e5c2d963-c081-4c97-8eb3-388d279dcd36",
>        "text": "this is the updated text",
>        "author": {
>          "id": "2",
>          "name": "Sarah"
>        }
>      }
>    }
>  }
>}
>```
>
>

