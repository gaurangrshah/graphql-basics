# GraphQL Subscriptions

---------------------------------

Subscriptions allow us to subscribe to a specific data set, i.e., "comments", and then fire an update anytime we see a new comment added without having to manually mutate the comments ourselves.

Subscriptions use web-sockets under the hood to keep an open channel of communcation between the sever and our client, allow us to update data and then subscribe to those updates to have them rendered back to the client automatically.

Subscriptions at first glance may seem very similar to queries, which also allow us to fetch only the data we need. The difference is in how the data is fetched when we use queries, we're able to query for the data we need and get back the all results that match that query - this is a one time operation with queries where the client is not notified of any updates to that data, —  and would then require us to run a mutation on that data to update that data or remove that data from our database. 

>  The standard work around is to use something called server-polling which basically runs a check for any updates at given intervals to check if the data was updated, and react to it when it finds updates

With subscriptions, we're utilzing web-sockets, which allow our data to keep an open channel of communication with our server and database. This allows the server to directly transmit changes back to the all of the subscribed clients when upates occur. 

The process of setting up a subscription is a bit more complex than our standard queries and/or mutations. 

Let's take a look at how a simple subscriptions work — Our goal is to subscribe to a stream of data, and get updates almost instantly when the server gets udpated itself. To test this behavoir our goal is to generate a new number every second, getting updates as they occur.

Like Queries and Mutations — Subscriptions also get defined as `typeDefs:`

```js
type Subscription {
    count: Int!
}
```

> here we've defined one variable for our data called count, which requries a integer that is non-nullable.



Since we've just refactored we'll also give subscriptions their own file: `src/resolvers/Subscription.js`:

```js
const Subscription = {

}

export {Subscription as default};
```

We'll also want to import the subscriptions into `index.js`:

```js
import Subscription from './resolvers/Subscription';
```

And then we'll also want to define subscriptions as a property on our resolvers: 

```js
const resolvers = {
  Query,
  Mutation,
  Subscription,
  Post,
  User,
  Comment,
}
```



**NOTE**: subscriptions in graphQL are avaialble via one of graphQL's key dependencies: `graphql-subscriptions`, this is a library available to us via the `apollo-graphql` package. 

> GraphQL Subscriptions library is a simply `pub`(publish) / `sub` (subscribe) utitlity
>
> https://github.com/apollographql/graphql-subscriptions

So in order to utitilze this `PubSub ` utility we must import it from `graphql-yoga`.

```js
import { GraphQLServer, PubSub } from 'graphql-yoga';
```

> ```js
> const pubsub = new PubSub();
> ```
>
> `PubSub` is a constructor that we utitlize to create a new instance of publish/subscribe util.

Now we can pass the new instance of `pubsub` to all of our resolvers by making it availble via the `ctx` argument

```js

const server = new GraphQLServer({
  // typeDefs,
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    db, // setting database to context.
    pubsub  // making pubsub instance accessible to resolvers
  }
});
```



Now that we have given access to our `pubsub` util to our resolvers, we can actually work out the logic that makes that work - For every subscription we'll have a new property, that property name will need to match-up to our subscription name. 

```js
const Subscription = {
  count
}

export { Subscription as default };

```

> — in this example we only have one property we're subscribing to called `count` — which we defined in our `typeDefs` as a non-nullable integer.

Now in order to allow a resolver to subscribe to count, we'll define it as an object, with a method on it called `subscribe()`:

```js
const Subscription = {
  count: {
    subscribe();
  }
}

export { Subscription as default };

```

> in our example we've got one object that we want to allow subscriptions to, called `count`, on that object we've defined one method, which is our `subscribe()` — this actually has access to the same `args` available to our resolvers:
>
> ```js
> const Subscription = {
>   count: {
>     subscribe(parent, args, { pubsub }, info) {
> 
>     }
>   }
> }
> 
> export { Subscription as default };
> 
> ```



Now our goal is to setup the subcription, and publish data to it:

```js
const Subscription = {
  count: {
    subscribe(parent, args, { pubsub }, info) {
      let count = 0

      return pubsub.asyncIterator('count')
      
    }
  }
}

export { Subscription as default };

```

>  `asyncIterator()` takes an argument called `channelName` — the published data is then accessible by any subscribers to each `channelName`



We can test this in the playground to make sure we're able to subscribe to count:

---------------------------------

> ```js
> subscription {
>   count
> }
> ```
>
> ![pendinglistener](http://ww3.sinaimg.cn/large/006tNc79ly1g4coni3qq8g313m0m4mzd.gif)



> We can see here that if we run this subscription, our yoga server starts listening for changes, it hasn't given us any data back, because our count value has not changed. When the value does change we'll see it is able to give us a data stream, updating as updates occur.



Next we can use `setInterval` to mock updates to our count variable:

```js
setInterval(() => { 
  count++   // increments the value of count each time setInterval fires.
  pubsub.publish('count', { // 1st arg is the `channelName`
    //2nd arg is an object with the data that is updated/published:
    count, // obj/prop shorthand, passing in the value of count to be published.
  }) // publishes the updates, to all subscribers.
}, 1000); // sets interval to 1sec.
```

> `setInteval` fires every second, updating the value of the count variable. then `pubsub.publish` is called to update any subscribers to the `count`-  `channelName`  which gets updated with the published data from the count variable - every time an update occurs.



So now if we run our subscription again:

---------------------------------

```js
subscription {
  count 
}
```

![subscribed](http://ww1.sinaimg.cn/large/006tNc79ly1g4coya3b1yg313m0m4qer.gif)

> we can see a steady stream of data flowing everytime our server updates the count variable when setInterval gets called.



