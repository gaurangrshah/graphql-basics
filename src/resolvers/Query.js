const Query = {
  users(parent, args, { db }, info) {
    if (!args.query) return db.users;
    return db.users.filter((user) => {
      return user.name.toLowerCase().includes(args.query.toLowerCase());
    })
  },
  me() {
    return {
      id: "123098",
      name: "Mike",
      email: "mike@example.com"
    }
  },
  post() {
    return {
      id: "001",
      title: "First Post Title",
      body: "Some Lorem Ipsum for the post body",
      published: false
    }
  },
  posts(parent, args, { db }, info) {
    if (!args.query) return db.posts;
    return db.posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
      const bodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());
      return titleMatch || bodyMatch
    })
  },
  comments(parent, args, { db }, info) {
    return db.comments;
  },
}

export { Query as default };
