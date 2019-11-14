---
group: graph-basics
published: true
---

# GraphQl Operation Arguments

---------------------------------

Allow us to pass data from the client to the server. Which is the opposite fo what we've been doing this far, where we've been pulling data from the server to the client. One of the main reasons we may want to pass client side data to the server is things like handling form submissions, allowing us to do things like register users and update the database with the new user. Or add a new post for a blog. 

Operation arguments also allow us to filter data, such as finding all posts that match a certain keyword. 

To explore operation arguments, let's create a new query:

```react
const typeDefs = `
	type Query {
    me: User!

    greeting(name: String): String!
	
		post: Post!
  }
```

> `greeting` must return a `String` (required(`!`) and takes one optional argument, notice that the argument doesn't have an (`!`) following it, which means that we've left it as optional.



Next we can assign our resolver for the greeting query.

```react
greeting() {
      return "Hello!"
    },
```



Now we can query this in the playground and see what our results are:

----------------------------------

gql playgrnd:

```json
query {
  greeting
}
```

```json
{
  "data": {
    "greeting": "Hello!"
  }
}
```

> note currently if we were to pass in our operational argument,, name, we'd get no response, because we have not defined what we'd like to do with the argument in our resolver.
>
> ```json
> query {
>   greeting(name: "Mike")
> }
> ```
>
> ```json
> {
>   "data": {
>     "greeting": "Hello!"
>   }
> }
> ```
>
> **NOTE**: the data is still being passed to the server, we're just not using the data in our resolver.



In order to access arguments, we have to take a look at the 4 arguments that are available to us on every resolver:

- `parent`: useful when working with relational data. i.e., parent argument can be utitlized to retrieve a specific user's posts. 
- ==`args`: contains the operational arguments being supplied (passed in.)==
- `context(ctx)`: context is used to keep track of contextual data, like the user's id & username when they are logged in. Which allows us to access that information throughout the applicaiton.
- `info`:  contains information about the actual operations sent along to the server.  



As we can see, in order for us to access our name argument, we need to use the args argument thats available to us from any resolver fn. 

Now when we run the query in the playground: 

```json
query {
  greeting (name:"Mike")
}
```

Our result is still the same:

```json
{
  "data": {
    "greeting": "Hello!"
  }
}
```

but our log statement prints to the console, so we are able to access the arguments we pass in from the client on the server. 

```json
served up
{ name: 'Mike' }
```

now let's handle any arguments that get passed in, with a dynamic response:

```react
greeting(parent, args, ctx, info) {
      if (args.name) return `Hello ${args.name}!`;
      return "Hello!"
    },
```

Then if we run the query in the playground:

```json
query {
  greeting (name:"Mike")
}
```

```json
{
  "data": {
    "greeting": "Hello Mike"
  }
}
```

> now we're able to act on the name arg if its available, and have a default greeting message return when no name is provided.

This can get as complex as we need it to:

```json
if (args.name && args.position) return `Hello ${args.position} ${args.name}!`;
```

which when run in playgorund: 

```json
query {
	greeting (name: "Tom", position: "Clerk")
}
```

```json
{
  "data": {
    "greeting": "Hello Clerk Tom!"
  }
}
```

---------------------------------



Challenge:

---------------------------------

1. Create an add query that returns a float.

2. set up "add" to take two arguments: (a, b) which are required floats.

   ```react
   add(a: Float!, b: Float!): Float
   ```

3. Have the resolver send back the sum of the two arguments.

   ```json
   add(parent, args, ctx, info) {
     if (args.a && args.b) return args.a + args.b;
     return (a, b)
   },
   ```

   ---------------------------------

> playground query:
>
> ```json
> query add{
>   add(a: 1.2, b: 3.5)
> }
> ```
>
> results:
>
> ```json
> {
>   "data": {
>     "add": 4.7
>   }
> }
> ```
>
> 



