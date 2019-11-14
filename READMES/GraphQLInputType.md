---
group: graph-basics
published: true
---

# GraphQL Input Type

---------------------------------

provides a way to optimize operation arguments for graphQL queries and mutations.

if we take a look at one of our current queries:

```js
users(query: String): [User!]
me: User!
```

and a current mutation we have defined already:

```js
createUser(name: String!, email: String!, age: Int): User!
```

We can clearly see that the idea of passing arguments into queries vs passing arguments into mutations, gets increasingly more complex as we create more dynamic actions with our mutations.



Instead we can use the Input Type to predefine arguments, that can then just be passed in as an object in place of the arguments.

Let's examine this by creating an input type for our createUser mutation:

```js
  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }
```

> now we have an object: `CreateUserInput` that can be passed in that now references all the arguments we need for our createUser mutation.

We can apply this object to our args in the mutation:

```js
createUser(data: CreateUserInput!): User!
```

> **NOTE**: only input types can be referenced as args in an arguments list. None of the other scalar, or custom types can be passed in like we can with the input type. This is because input types are only able to have scalar values, which also means we cannot have another custom type referenced from an input type. 

We'll need to edit our mutation to ensure it pulls our args from the data object we pass in:

```js
createUser(parent, args, ctx, info) {

  // .some() will iterate over users to find any user.email that matches args.email
  const emailTaken = users.some((user) => user.email === args.data.email);
  //validate email address uniqueness:
  if (emailTaken) throw new Error('Email taken')

  const user = {
    // define new user object
    id: uuidv4(), // use uuidv4 to create a random user id
    ...args.data
  }

  // adds new user object onto users array
  users.push(user);

  // returns new user
  return user
},

```

> all we've done here is ensured we're referencing data off of args: `args.data`.



So now when we need to create a new user in the playground we must reference our variables in the same way, pulling them off of the data object that gets passed in:

```js
mutation {
  createUser(data:{name: "g", email: "g@g.com", age: 27}){
    id
    name
    email
    age
  }
}
```

> here `data` is an object that provides all of the arguments we need to create a user.





Now let's test the mutation:

---------------------------------

> ```json
> mutation {
>   createUser(data:{name: "g", email: "g@g.com", age: 27}){
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
>       "id": "66a86916-45e7-4799-aedf-7b28cad94495",
>       "name": "g",
>       "email": "g@g.com",
>       "age": 27
>     }
>   }
> }
> ```
>
> 

