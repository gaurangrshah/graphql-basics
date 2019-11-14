---
group: graph-basics
published: true
---
# Creating Custom Types

---------------------------------

Custom types allow us to model the data that makes up our appication. In this way we can define several custom types for each aspect of our applicaiton i.e., (Users, Posts, Comments, etc.). Each of these types can have their own set of fields. 

New custom types are defined as a `type defintion`:

```json
const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }
`;
```



In order to work with this type definition for the User Type, we'll need to define our query for it:

```json
const typeDefs = `
	type Query {
    me: User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }
`;
```

> the query for "me" returns a user (and must return a user: required(`!`))



Next we'd normally be able to query for users in our database based on the types we've defined, by defining resolvers to handle that data, but we don't have a database yet, so we'll pass in the values we'd like to see returned for our user as a test and setup our resolver with some default values:

```json
const resolvers = {
  Query: {
    me() {
      return {
        id: "123098",
        name: "Mike",
        email: "mike@example.com"      }
    }
  }
};
```



> We can then check our *playground* (refresh to update):
>
> ------
>
> ```json
> query {
>   me {
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
>     "me": {
>       "id": "123098",
>       "name": "Mike",
>       "email": "mike@example.com",
>       "age": null
>     }
>   }
> }
> ```



Challenge:

---------------------------------

1. Create a Post type

2. Add id, title, body, and published to the Post type (all non-nullable)

   ```js
     type Post {
       id: ID!
       title: String!
       body: String!
       published: Boolean!
     }
   ```

3. Define  "post" query that returns a single post

   ```js
   	type Query {
       me: User!
       post: Post!
     }
   ```

4. Set up the resolver method to return some post data

   ```js
   post() {
     return {
       id: "001",
       title: "First Post Title",
       body: "Some Lorem Ipsum for the post body",
       published: false
     }
   }
   ```

   

5. Test out the query

   ---------------------------------

   ```js
   query {
     post{
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
       "post": {
         "id": "001",
         "title": "First Post Title",
         "body": "Some Lorem Ipsum for the post body",
         "published": false
       }
     }
   }
   ```

   

