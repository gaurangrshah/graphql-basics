# Subscription Posts

---------------------------------

Challenge: Create a Subscription for new posts

1. Define a "post" subscription. No arguments needed. Response should be a post object. `src/schema.graphql`

   ```js
   post: Post!
   ```

2. Setup the resolver for post. Since there are no args, a channel name like "post" is fine. `src/resolvers/Subscription.js`:

   ```js
     post: {
       subscribe(parent, args, {pubsub}, info) {
   
   
         return pubsub.asyncIterator('post');
       }
     },
   ```

3. Modify the mutation for creating a post to publish the post data.

   - Only call pubsub.publish if the post had "published" set to true.
   - Don't worry about updatePost or deletePost.

   `src/resovlers/Mutation.js`

   ```js
     createPost(parent, args, { db, pubsub }, info) {
   
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
   
       // setup subscription publishing:
       if (args.data.published) pubsub.publish('post', { post });
   
       // return new post
       return post
     },
   ```





4. Test the subscription

---------------------------------

> ```js
> subscription post {
>   post {
>     id
>     title
>     body
>     author{
>       id
>       name
>     }
>   }
> }
> ```
>
> ```json
> mutation createPost{
>   createPost(data: {title:"new post4", body: "lorem for new post4", published: false, author: "1"}) {
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
> ```
>
> ![createpostsub](http://ww2.sinaimg.cn/large/006tNc79ly1g4cyccgnl1g30rc0p0u0y.gif)



---------------------------------

# Editing & Deleting Posts via Subscriptions

---------------------------------

The whole purpose of subscriptions is to keep data in sync, in order to achieve this we'll need to ensure our subscriptions are also looking for edit and delete changes. To do this we can pass along a mutation along with our subscription, that will have a value which tells us what action is being performed on our data: i.e., Update, Delete, etc.

To start let's modify our post subscription definition: — we'll need a brand new `typeDef` to handle the args that get passed in:

```js
type PostSubscriptionPayload {
    mutation: String!
    data: Post!
}
```

> PostSubscriptionPayload is the payload that we'll be passing into our post subscription typeDef:
>
> ```js
> type Subscription {
>     comment(postId: ID!): Comment!
>     post: PostSubscriptionPayload!
> }
> ```
>
> 

Update the createPost mutation to allow subscriptions `src/resolvers/Mutation.js`:

```js
if (args.data.published) pubsub.publish('post', { 
  post: {
    mutation: 'CREATED', // type of mutation being published
    data: post // data gets assigned the value held by the post variable.
  }
});
```



Run query test subscription:

---------------------------------

> Subscribe to post:
>
> ```js
> subscription post {
>   post {
> 		mutation
>     data{
>       id
>       title
>       body
>       author {
>         id
>         name
>       }
>     }
>   }
> }
> ```
>
> Create new Post:
>
> ```json
> mutation createPost{
>   createPost(data: {title:"new post4", body: "lorem for new post4", published: true, author: "1"}) {
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
> ```
>
> Post gets created"
>
> ```js
> {
>   "data": {
>     "createPost": {
>       "id": "9f85e900-3a6e-43cf-a714-76c26dafbb5f",
>       "title": "new post4",
>       "body": "lorem for new post4",
>       "published": true,
>       "author": {
>         "name": "Andrew"
>       },
>       "comments": []
>     }
>   }
> }
> ```
>
> subscription gets updated:
>
> ```json
> {
>   "data": {
>     "post": {
>       "mutation": "CREATED",
>       "data": {
>         "id": "9f85e900-3a6e-43cf-a714-76c26dafbb5f",
>         "title": "new post4",
>         "body": "lorem for new post4",
>         "author": {
>           "id": "1",
>           "name": "Andrew"
>         }
>       }
>     }
>   }
> }
> ```



Now we can do the same for Delete post: `src/resolvers/Mutation.js`

```js
  deletePost(parent, args, { db, pubsub }, info) {
    // destructure 'pubsub' from ctx
    
    // check if post exists
    const postIndex = db.posts.findIndex((post) => post.id === args.id)
    // throw error if post does not exist
    if (postIndex === -1) throw new Error('post not found')


    // remove the deleted post
    // const deletedPosts = db.posts.splice(postIndex, 1);
    const [post] = db.posts.splice(postIndex, 1);
    // destructure the first item from deletedPosts, as 'post'

    
    // remove all comments associated with the post.
    db.comments = db.comments.filter((comment) => comment.post !== args.id);

    if (post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'DELETED',
          data: post,
        }
      });
    }
    // return first item off deletedPosts array
    return post;
  },
```



Test Subscription:

---------------------------------

> Run Subscription:
>
> ```js
> subscription post {
>   post {
> 		mutation
>     data{
>       id
>       title
>       body
>       author {
>         id
>         name
>       }
>     }
>   }
> }
> 
> ```
>
> Delete Post
>
> ```js
> mutation deletePost{
>   deletePost(id: "12") {
>     id
>     comments{
>       id
>     }
>   }
> }
> ```
>
> Deleted Post:
>
> ```json
> {
>   "data": {
>     "deletePost": {
>       "id": "12",
>       "comments": []
>     }
>   }
> }
> ```
>
> Subscription triggered:
>
> ```json
> {
>   "data": {
>     "post": {
>       "mutation": "DELETED",
>       "data": {
>         "id": "12",
>         "title": "Programming Music",
>         "body": "",
>         "author": {
>           "id": "2",
>           "name": "Sarah"
>         }
>       }
>     }
>   }
> }
> ```
>
> > **NOTE**: that we're successfully triggering our "Deleted" mutation when the post gets deleted
>
> if we were to delete a post that is not publised, we would not get a subscription notification, only published posts will trigger this notification, since, we don't want drafts to trigger any notifications:
>
> ```js
> mutation deletePost{
>   deletePost(id: "11") {
>     id
>     comments{
>       id
>     }
>   }
> }
> ```
>
> > post id = 11 - is an unpublished post
>
> deleted post:
>
> ```js
> {
>   "data": {
>     "deletePost": {
>       "id": "11",
>       "comments": []
>     }
>   }
> }
> ```
>
> BUT NO SUBSCRIPTION OUTPUT SHOULD BE TRIGGERED





Let's now take a look at updating post, which is probably the most complex out of all of them - we'll want to make sure that we're only triggering an update when an actual update to the content occurs, and not trigger update when a post is created or deleted — which should invoke their own respesctive actions without triggering update:

```js
  updatePost(parent, { id, data }, { db, pubsub }, info) {
    const { id, data } = args
    const post = db.posts.find((post) => post.id === id);

    // holds the value of the original post so that we can compare if it gets updated.
    const originalPost = { ...post } // clone all properties from post to originalPost

    // holds the value of the original post so that we can compare if it gets updated.
    const originalPost = { ...post } // clone all properties from post to originalPost

    
    if (!post) throw new Error('post not found')

    if (data.title === 'string') { post.title = data.title; }
    if (data.body === 'string') { post.body = data.body; }

    
    if (data.published === 'boolean') {
      post.published = data.published;

      // check if post is being published or unpublished - before updating - using originalPost
      if (originalPost.published && !post.pubslished) {
        // check if the post was previously published an is now being unpublished
        // fire deleted event
      } else if (!originalPost.published && post.published) {
        // check if post was previously unpublished, but is now being published
        // fire created event
      }
    } else if (post.published) {
      // update event
    }

    return post
  },
```

> we're using several conditional checks using the posts published property to determine whether this is a new post being created or an older post either being updated or deleted. 

```js
      // check if the post was previously published an is now being unpublished
      if (originalPost.published && !post.pubslished) {
        pubsub.publish('post', {
          // fire deleted event
          post: {
            mutation: 'DELETED', // defines type of action that was fired
            data: originalPost, // uses originalPost, to avoid leaking any unwanted drafted changes.
          }
        })
      } else if (!originalPost.published && post.published) {
        // check if post was previously unpublished, but is now being published
        // fire created event
        pubsub.pubslish('post', {
          mutation: 'CREATED',
          data: post, // passes in the lastest value when Created event is triggered.
        })
      }
     else if (post.published) {
      // update event
      pubsub.publish('post', {
        mutation: 'UPDATED',  //triggers update
        data: post,   // passes in the latest value when updated event is triggered
      })
    }
```



Alternative version, seems to work for an edge case, where when updating content, we successfully trigger update, btut the content does not actually updated.

```js
if (data.published === 'boolean') {
  post.published = data.published;
}

const wasDeleted = originalPost.published && !post.published;
const wasCreated = !originalPost.published && post.published;

if (wasDeleted || wasCreated || post.published) {
  pubsub.publish('post', {
    post: {
      mutation: ((wasDeleted) ? 'DELETED' : wasCreated ? 'CREATED' : 'UPDATED'),
      data: (wasDeleted) ? originalPost : post,
    }
  })
}
```

---------------------------------

Test in playground: updatePost - start by running the post subscriber - next we can run our update mutation:

```js
mutation updatePost{
  updatePost(id: "10", data: {body: "Yello Nurse", published: true}) {
    id
    title
    body
    published
  }
}
```

```js
{
  "data": {
    "updatePost": {
      "id": "10",
      "title": "GraphQL 101",
      "body": "Yello Nurse",
      "published": true
    }
  }
}
```

```js
{
  "data": {
    "post": {
      "mutation": "UPDATED",
      "data": {
        "id": "10",
        "title": "GraphQL 101",
        "body": "Yello Nurse",
        "author": {
          "id": "1",
          "name": "Andrew"
        }
      }
    }
  }
}
```

