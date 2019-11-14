---
group: graph-basics
published: true
---

## Relational Data Basics:

---------------------------------

Relational data in graphQL allows us to specify and set up our custom types. Most data is never standable, for example, Posts are owned by users, and Users can also be authors on a post. This type of relational data binding allows us to create scalable applications.

![image-20190618115620382](http://ww1.sinaimg.cn/large/006tNc79ly1g45r0jtgekj30tr0f30x0.jpg)

> In graphql its up to the client to request the appropriate data at the appropriate time. 

Let's explore this by setting up a relationship for users and posts starting with our `typeDefs`:

```js
  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
  }
```

> we've added a field called `author` that references our `User` type, and is non-nullable/required(`!`)because each post should have an `author`.

We'll update our data to add our author's relationship to each post, using the author's id:

```js
const posts = [{
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
},
{
  id: '003',
  title: 'Post Title 3',
  body: 'Some Lorem for post 3',
  published: false,
  author: '3'
}]
```

> we've added an author field that references the id of the corresponding user.

Now we'll need to create a new resolver object for just our `Post` type:

```js
  Post: {
    
  }
```

On this post object we can now setup a resolver method that is used to deal with any of our relational data for the `Post` type:

```js
Post: {
  author(parent, args, ctx, info) {

  }
}
```

```js
Post: {
  author(parent, args, ctx, info) {
    // we can iterate over each post object using the 'parent' argument: (parent = post);
    return users.find((user) => {
      // use find to iterate over the users, and match author id:
      return user.id === parent.author;
    });
  }
}
```

> `.find()` is similar to filter but only returns the first match found.

> gqlpg
>
> -----------------------------------
>
> ```json
> query posts{
>   posts {
>     id
>     title
>     body
>     published
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
>     "posts": [
>       {
>         "id": "001",
>         "title": "Post Title 1",
>         "body": "Some Lorem for post 1",
>         "published": true,
>         "author": {
>           "name": "Jane"
>         }
>       },
>       {
>         "id": "002",
>         "title": "Post Title 2",
>         "body": "Some Lorem for post 2",
>         "published": true,
>         "author": {
>           "name": "Jane"
>         }
>       },
>       {
>         "id": "003",
>         "title": "Post Title 3",
>         "body": "Some Lorem for post 3",
>         "published": false,
>         "author": {
>           "name": "Mike"
>         }
>       }
>     ]
>   }
> }
> ```
>
> > we're able to access the `User` type from the author relationship we've setup between posts and users, and use that to retrieve the author name for each post from the user object itself.
>
> The next step is to bind the data the other way where we are able to find posts that belong to each author.



In order to do that we'll need to modify our `User` type to include a `posts` field:

```js
posts: [Post!]!
```



Now we can wire up a custom resolver `User` object to be able to resolve any queries for any `posts` associated with the `user`.

```js
  Post: {
    author(parent, args, ctx, info) {
      // we can iterate over each post object using the 'parent' argument: (parent = post);
      return users.find((user) => {
        // use find to iterate over the users, to match to our author id:
        return user.id === parent.author;
      });
    }
  },
  User: {
    
  }
```

> **NOTE**: anytime we're relying on a custom Type as a field, we need to define a custom resolver to handle and interact with that data from its relational counterpart.

```js
  User: {
    posts(parent, args, ctx, info) {
      
    }
  }
```

> since posts is the custom query we want to handle, we can define that as a method in our `User` resolver object

```js
posts(parent, args, ctx, info) {
  // we can iterate over each post associated with this user: (parent: user)
  return posts.filter((post) => {
    // filter any posts whose author matches parent(user).id;
    return post.author === parent.id;
  })
}
```



> gqlpg
>
> ---------------------------------
>
> ```json
> query users{
>   users{
>     id
>     name
>     email
>     age
>     posts {
>       id
>       title
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
>         ]
>       },
>       {
>         "id": "2",
>         "name": "John",
>         "email": "info2@infoesque.net",
>         "age": null,
>         "posts": []
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
>         ]
>       }
>     ]
>   }
> }
> ```
>
> > now we are able to return the information regard the posts associated with our users



**NOTE** : now that the relationship between posts and users, is bi-directional, we are able to do some deeply nested queries such as:

> gqlpg
>
> ---------------------------------
>
> ```json
> query users{
>   users{
>     id
>     name
>     email
>     age
>     posts {
>       id
>       title
>       author {
>         name
>       }
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
>         "id": "1",
>         "name": "Jane",
>         "email": "info@infoesque.net",
>         "age": null,
>         "posts": [
>           {
>             "id": "001",
>             "title": "Post Title 1",
>             "author": {
>               "name": "Jane"
>             }
>           },
>           {
>             "id": "002",
>             "title": "Post Title 2",
>             "author": {
>               "name": "Jane"
>             }
>           }
>         ]
>       },
>       {
>         "id": "2",
>         "name": "John",
>         "email": "info2@infoesque.net",
>         "age": null,
>         "posts": []
>       },
>       {
>         "id": "3",
>         "name": "Mike",
>         "email": "info3@infoesque.net",
>         "age": null,
>         "posts": [
>           {
>             "id": "003",
>             "title": "Post Title 3",
>             "author": {
>               "name": "Mike"
>             }
>           }
>         ]
>       }
>     ]
>   }
> }
> ```
>
> > this may not serve any real world purpose bu you'll notice that we are again able to access our user information from our posts, since that is a totally valid query on its own, with our bi-directional data relationship between `user` and `post`

