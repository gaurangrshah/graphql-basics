---
group: graph-basics
published: true
---

# Setup GraphQL API

---------------------------------

Graphql is a simple query language. It's basic function is to setup the specifications upon which we're able to query items from our api. Graphql is dependent upon the implementation to provide it's functionality for each project for example chrome and node both use an implementation of the V8 engine. Mozilla uses spidermonkey, and Microsoft uses chakra these are all implmentations of the javascript runtime. For our purposes we just need an implmentation that works with node. For graphql we'll be using the implementation for node provided by GraphQL Yoga.

```js
npm i graphql-yoga@1.16.7
```

GraphQL Yoga - Docs: https://github.com/prisma/graphql-yoga



Import GraphQL Yoga: `index.js`

```react
import {GraphQLServer } from 'graphql-yoga'
```

Configure the graphQL `type definitions` and `resolvers` needed to setup our server:

```react
const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(() => (
	console.log('served up')
));
```

- <u>`Type Definitions`</u> (aka Application Schema) - Defines the available fields and the expected types of those fields from the application's schema.
- <u>`Resolvers`</u> - are functions that run for each of the operations that can be performed.



Create a simple `typeDef` for the `String` "hello

```js
const typeDefs = `
	type Query {
		hello: String!
}
`;
```

> Here we have defined our type defs. which includes a single query that has one field that must return a string.
>
> **NOTE**: query's are defined inside backticks `(``)` in the gql query syntax.
>
> ==**NOTE**: Query's are used exclusively to retrieve and fetch data==



For each query graphql needs a resolver to act on that query:

```react
const resolvers = {
  Query: {
    hello() {
      return "Hello from resolver"
    }
  }
};
```



Next we can start up our server once again by running:

```shell
npm run start
```

> This will run in watch mode, and make our graphql playground available at http://localhost:4000



---------------------------------

graphql playground

```json
query {
  hello
}
```

```json
{
  "data": {
    "hello": "Hello from resolver"
  }
}
```

As we can see we are no wable to query for the hello string via our graphql playground.

---------------------------------



Next lets see if we can add a new query for a new field and run a query for that new field:

```react
const typeDefs = `
	type Query {
    hello: String!
    name: String!
}
`;
```

```js
const resolvers = {
  Query: {
    hello() {
      return "Hello from resolver"
    },
    name() {
      return "Your Name"
    }
  }
};
```



**NOTE** : Everytime you updates schema, we need to redeploy our schema, so our playground / server has access to the new typeDefs and resolvers. 

------

graphql playground

```json
query {
	name
}
```

```json
{
  "data": {
    "name": "Your Name"
  }
}
```

---------------------------------

Challenge:

Add two queries:  1. "Location" /  2. "Bio":

```js
const typeDefs = `
	type Query {
    hello: String!
    name: String!
    location: String!
    bio: String!
}
`;

const resolvers = {
  Query: {
    hello() {
      return "Hello from resolver"
    },
    name() {
      return "Your Name"
    },
    location() {
      return "This Place"
    },
    bio() {
      return "This is my story"
    }
  }
};
```



---------------------------------

graphql playground

```json
# Write your query or mutation here
query {
	location
}
```

```json
{
  "data": {
    "location": "This Place"
  }
}
```

```json
query {
	bio
}
```

```json
{
  "data": {
    "bio": "This is my story"
  }
}
```

