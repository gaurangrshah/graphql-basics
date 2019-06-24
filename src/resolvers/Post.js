const Post = {
  author(parent, args, { db }, info) {

    // we can iterate over each post object using the 'parent' argument: (parent = post);
    return db.users.find((user) => {

      // use find to iterate over the users, to match to our author id:
      return user.id === parent.author;

    });
  },
  comments(parent, args, { db }, info) {

    // we can iterate over each comment associated with the post: (parent: post)
    return db.comments.filter((comment) => {

      // filter any comments whose post value matches parent(post).id;
      return comment.post === parent.id;

    })
  },
}

export { Post as default };
