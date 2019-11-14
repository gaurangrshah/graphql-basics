---
group: graph-basics
published: true
---

# GraphQL Arrays

---------------------------------

Arrays are one of the Non-Scalar types available to us in GraphQL, these arrays can hold many different types of values, but we'll start by looking at arrays that hold some scalar type values with a new query:

```react
grades: [Int!]!
```

> A query for grades will always return an array of integers which are non nullable, meaning if there is an item, that item's value cannot be null, it must be an integer.



Next let's setup our resolver, we need to hardcode a response for the expected result - since we have no data in the server atm. 

```react
grades(parent, args, ctx, info) {
  return [99, 80 , 26, 78];
}
```



Now that we have a resolver hard coded with some data, we can test this query in GQLPG:

---------------------------------

```json
query{
  grades
}
```

```json
{
  "data": {
    "grades": [
      99,
      80,
      26,
      78
    ]
  }
}
```



**NOTE**: with an array of scalar types, there are not args that we can provide the query to grab a particular grade out of the array for example. With an array of objects we can pass in the fields we'd want off the object, but with an array of scalar types the array itself is the smallest unit we can query for. 



Now let's see if we can send data back from the server, to do this we'll modify our add query to take in an array of floats:

```react
    add(numbers: [Float]!): Float!
```

> `add` now takes an array of numbers which is required(`!`), which are floats, and will return a Float!

We can update our `add` resolver function:

```react
add(parent, args, ctx, info) {
  if (args.numbers.length === 0) return 0;
  
  return args.numbers.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  })
  
},
```

> `reduce` adds up all the items in an array using the accumulator to keep tally, and adding each value in order from L to R.





## Arrays of Custom Types

---------------------------------

Aside from being able work with scalar types avialable to us from GraphQL we can work with arrays of custom types, that is types that we've defined, such as an array of users, or an array of posts, these arrays could also be arrays of objects containing other arrays. Allowing us to create more dynamic responses, and query only for the data we actually need. 



Create a query for an array of users:

```react
users: [User!]!
```

> this query will always return an array of objects each containing a User, both the array and the User are non-nullable and required(`!`)

This references the User type we've defined:

```js
type User {
  id: ID!
    name: String!
      email: String!
        age: Int
}
```

handle the resolver function for the query:

```js
users(parent, args, ctx, info) {
  return users
},
```

instead of hard coding the data into the resovler for testing — like we've been doing, we'll define an array of demo-data that we can use instead.

```js
const users = [{
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
```



GQLPG: 

---------------------------------

```json
query {
  users {
    id
    name
    email
    age
  }
}
```

```json
{
  "data": {
    "users": [
      {
        "id": "1",
        "name": "Jane",
        "email": "info@infoesque.net",
        "age": null
      },
      {
        "id": "2",
        "name": "John",
        "email": "info2@infoesque.net",
        "age": null
      },
      {
        "id": "3",
        "name": "Mike",
        "email": "info3@infoesque.net",
        "age": null
      }
    ]
  }
}
```





Now we can see how we can interact with data on the server, that we've defined types for, like our user type. This type of implementation is used typically to be able to extend the basic functionality, allowing for things like sorting and filtering using queries and resolvers, that are meant to interact with this data allowing us to further select and filter thru the data, when querying for results.3

let's setup an optional argument for the users query:

```js
users(query: String): [User!]
```

then we can modify our resolver to return items that match our `query` argument, when an argument is passed in:

```js
users(parent, args, ctx, info) {
  if (!args.query) return users; // if no query arg -> return users;
  return users.filter((user) => { // filter each user
    return user.name.toLowerCase().includes(args.query.toLowerCase());
    // match username to arg.query
  })
},
```

> we've used `.toLowerCase()` to ensure our query matches the right string, regardless of case.



Now not only does our intial query still work, but we can now pass in a string as an argument for querying our data:

> GQLPG:
>
> ------
>
> ```json
> query {
>   users(query: "J") {
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
>     "users": [
>       {
>         "id": "1",
>         "name": "Jane",
>         "email": "info@infoesque.net",
>         "age": null
>       },
>       {
>         "id": "2",
>         "name": "John",
>         "email": "info2@infoesque.net",
>         "age": null
>       }
>     ]
>   }
> }
> ```
>
> >  This time we only get two results back, the results whose names match our query.
>
> What if we queried for a result that had no matches:
>
> ```json
> query {
>   users(query: "z") {
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
>     "users": []
>   }
> }
> ```
>
> > we get back an empty array, which is what we expected from the query:
> >
> > ```js
> > users(query: String): [User!]
> > ```



---------------------------------

Challenge:

1. Set up an array of three posts with dummy post data {id, title, body, published}

   ```js
   const posts = [{
     id: '001',
     title: 'Post Title 1',
     body: 'Some Lorem for post 1',
     published: true
   }, {
     id: '002',
     title: 'Post Title 2',
     body: 'Some Lorem for post 2',
     published: true
   },
   {
     id: '003',
     title: 'Post Title 3',
     body: 'Some Lorem for post 3',
     published: false
   }]
   ```

2. Set up a "posts" query 

   ```js
   posts: [Post!]
   ```

   2b. and resolver that returns all the posts

   ```js
   posts(parent, args, ctx, info) {
     return posts;
   }
   ```

3. Test the query 

   > <u>gqlpg</u>
   >
   > ---------------------------------
   >
   > ```json
   > query posts {
   >   posts {
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
   >     "posts": [
   >       {
   >         "id": "001",
   >         "title": "Post Title 1",
   >         "body": "Some Lorem for post 1",
   >         "published": true
   >       },
   >       {
   >         "id": "002",
   >         "title": "Post Title 2",
   >         "body": "Some Lorem for post 2",
   >         "published": true
   >       },
   >       {
   >         "id": "003",
   >         "title": "Post Title 3",
   >         "body": "Some Lorem for post 3",
   >         "published": false
   >       }
   >     ]
   >   }
   > }
   > ```

4. Add a "query" argument that only returns posts that contain the query string in the title or body

   ```js
   posts(parent, args, ctx, info) {
     if (!args.query) return posts;
     return posts.filter((post) => {
       const titleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
       const bodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());
       return titleMatch || bodyMatch
     })
   },
   ```

   > checking to ensure either the title or the body match our provided arguments if any are provided.

   

5. Run a few sample queries searching for posts with specific title.

> ```json
> query posts{
>   posts(query: "2") {
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
>     "posts": [
>       {
>         "id": "002",
>         "title": "Post Title 2",
>         "body": "Some Lorem for post 2",
>         "published": true
>       }
>     ]
>   }
> }
> ```
>
> ```json
> query posts{
>   posts(query: "lorem") {
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
>     "posts": [
>       {
>         "id": "001",
>         "title": "Post Title 1",
>         "body": "Some Lorem for post 1",
>         "published": true
>       },
>       {
>         "id": "002",
>         "title": "Post Title 2",
>         "body": "Some Lorem for post 2",
>         "published": true
>       },
>       {
>         "id": "003",
>         "title": "Post Title 3",
>         "body": "Some Lorem for post 3",
>         "published": false
>       }
>     ]
>   }
> }
> ```
