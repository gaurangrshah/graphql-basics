const Subscription = {
  comment: {
    subscribe(parent, { postId }, { db, pubsub }, info) {
      // 1. check if post exists & is published
      const post = db.posts.find((post) => post.id === postId && post.published)
      if (!post) throw new Error('no post found');

      // 2. return asyncIterator subscribed to a channelName:
      return pubsub.asyncIterator(`comment ${postId}`)
      // using template strings to dynamically inject postId into channelName
    }
  },
  post: {
    subscribe(parent, args, { pubsub }, info) {
      return pubsub.asyncIterator('post');
    }
  }
}

export { Subscription as default };
