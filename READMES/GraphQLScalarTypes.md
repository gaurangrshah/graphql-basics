# GraphQL Scalar Types

---------------------------------

GraphQL offers several types of data that we can use to define our schema. These types offer us a similar set of data objects that we can access like we have in javascript. 

Here are some of the types we'll be dealing with:

1. String
2. Boolean
3. Int (Integers)
4. Float (floating point number)
5. ID (used to represent unique identifiers)

> **NOTE**: These 5 types are known as the <u>Scalar Types</u> in GraphQL. A Scalar Type is a type that stores a single value. 
>
> Collections of Scalar Types are known as <u>Non-Scalar Types</u>, two familiar examples would be objects and arrays, which are both known as non-scalar types.



Next we'll take a look at how to create types in GraphQL, by identifying any fields required for that type, and assigning those fields to the expected data type we want for that field, we are able to create types. 

Here' is the schema for a "person" type:

```js
const typeDefs = `
	type Query {
    id: ID!
    name: String!
    age: Int!
    employed: Boolean!
    gpa: Float
}
`;
```

> **NOTE**: that each field is required, expect for the "gpa" which only students will have assigned. This means, that its ok if we query our person type and there is no value for a gpa, but if there is a value we expect that value to return a `Float`



Once our query is setup we can create resolvers for each one:

```js
const resolvers = {
  Query: {
    id() {
      return 'abc123'
    },
    name() {
      return 'Me'
    },
    age() {
      return 27
    },
    employed() {
      return true
    },
    gpa() {
      return null
    }
  }
};
```



---------------------------------

GraphQL Playground:

```json
query {
	id
  name
  age
  employed
  gpa
}
```

```json
{
  "data": {
    "id": "abc123",
    "name": "Me",
    "age": 27,
    "employed": true,
    "gpa": null
  }
}
```

---------------------------------



Challenge:

Create a query definition and resolver for each:

1. title - string (product name)
2. price - number as float
3. releaseYear - number as int (optional)
4. rating - number as float (optional)
5. inStock - boolean

```js
const typeDefs = `
	type Query {
    title: String!
    price: Float!
    releaseYear: Int
    rating: Float
    inStock: Boolean!
}
`;


const resolvers = {
  Query: {
    title() {
      return "This Product"
    },
    price() {
      return 99.99
    },
    releaseYear() {
      return 2019
    },
    rating() {
      return 2.9
    },
    inStock() {
      return true
    },
  }
};
```

---------------------------------

GraphQL Playground

```json
query {
	title
  price
  releaseYear
  rating
  inStock
}
```

```json
{
  "data": {
    "id": "abc123",
    "name": "Me",
    "age": 27,
    "employed": true,
    "gpa": null
  }
}
```



