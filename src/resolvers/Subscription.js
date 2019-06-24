const Subscription = {
  count: {
    subscribe(parent, args, { pubsub }, info) {
      let count = 0

      setInterval(() => {
        count++   // increments the value of count each time setInterval fires.
        pubsub.publish('count', { // 1st arg is the `channelName`
          //2nd arg is an object with the data that is updated/published:
          count, // obj/prop shorthand, passing in the value of count to be published.
        }) // publishes the updates, to all subscribers.
      }, 1000); // sets interval to 1sec.

      return pubsub.asyncIterator('count')
      // `asyncIterator()` takes an argument called `channelName`
      // the published data is then accessible by any subscribers to each `channelName`
    }
  }
}

export { Subscription as default };
