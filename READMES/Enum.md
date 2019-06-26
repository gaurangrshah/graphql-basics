# Enum Type

---------------------------------

1. A special type that defines a set of constants.
2. This type can then be used as the type for a field (similar to scalar and custom object types)
3. Vales for the field must be one of the constants for the type



For example, if we wanted to have a type for our userRoles:

```js
UserRole = standard, editor, admin

type User {
  role: UserRole
}
```

> in this way we can use enums to create very extensible code, using them to define types for fields.
>
> enums actually work similar to booleans, but offer more complex options than simple true / false booleans:
>
> ```js
> Laptop.powerStatus = on - off - sleep
> ```
>
> While booleans could've easily handled part of this logic as our application gets come comples, we'll enivtably be dealing with considerable criteria for our conditionals.



Currently in our `src/resolvers/Mutation.js` we're using the type `String!` to define our expected value for our mutations defined inour subscription payloads. But in actuality we only expect one of three string values: `CREATED`, `UPDATED` or `DELETED`, this is where we would want to use an enum. Eventhough our currently logic works, enums will enforce the usage of only these three action types for our subscription:

```js
// defined enum MutationType with 3 possible params:
enum MutationType {
    CREATED
    UPDATED
    DELETED
}

type PostSubscriptionPayload {
    mutation: MutationType! // uses the MutationType from above
    data: Post!
}

type CommentSubscriptionPayload {
    mutation: MutationType! // uses the MutationType from above
    data: Comment!
}

```

> **NOTE**: if any other values aside from `CREATED`, `UPDATED`, & `DELETED` are passed in, our subscription will throw an error: mispelled: `createde`
>
> ```js
> {
>   "errors": [
>     {
>       "message": "Expected a value of type \"MutationType\" but received: \"CREATEDE\"",
>       "locations": [
>         {
>           "line": 3,
>           "column": 5
>         }
>       ],
>       "path": [
>         "comment",
>         "mutation"
>       ]
>     }
>   ],
>   "data": null
> }
> ```
>
> 