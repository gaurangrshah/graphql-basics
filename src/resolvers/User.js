const User = {

  posts(parent, args, { db }, info) {

    // we can iterate over each post associated with this user: (parent: user)
    return db.posts.filter((post) => {

      // filter any posts whose author matches parent(user).id;
      return post.author === parent.id;

    })
  },

  comments(parent, args, { db }, info) {

    // we can iterate over each comment associated with the user: (parent: user)
    return db.comments.filter((comment) => {

      // filter any comments whose author matches parent(user).id;
      return comment.author === parent.id;

    })
  },

}

export { User as default };
