import uuidv4 from 'uuid/v4';
// version 4 of uuid - generates completely random ids.

const Mutation = {
  createUser(parent, args, { db }, info) {

    // .some() will iterate over ctx.db.users to find any user.email that matches args.email
    const emailTaken = db.users.some((user) => user.email === args.data.email);
    //validate email address uniqueness:
    if (emailTaken) throw new Error('Email taken')

    const user = {
      // define new user object
      id: uuidv4(), // use uuidv4 to create a random user id
      ...args.data
    }

    // adds new user object onto users array
    db.users.push(user);

    // returns new user
    return user
  },

  deleteUser(parent, args, { db }, info) {
    // find index will find the index for the user that's passed
    const userIndex = db.users.findIndex((user) => user.id === args.id);
    // when findIndex doesn't find an index for the user, it will default to (-1):
    if (userIndex === -1) throw new Error('user not found');
    // make sure we have an index for the user that get's passed in, then:

    // remove user from array
    const deletedUsers = db.users.splice(userIndex, 1)
    // use splice() to remove user with matching id, and only remove 1 user.


    // remove all associated posts

    db.posts = db.posts.filter((post) => {
      // use array.filer() to filter out any data associated with this user.
      const match = post.author === args.id;

      // when deleting a post that is a match, first remove all associated comments:
      if (match) return db.comments = db.comments.filter((comment) => comment.post !== post.id);
      // keep all comments that do not match the post id.

      // return false when we find a match - to filter out the matching post
      return !match
    });

    // remove all other comments associated to deleted user
    // if this user has comments on other user's posts, remove those comments as well:
    db.comments = db.comments.filter((comment) => comment.author !== args.id);

    // return first item in array of deletedUsers
    return deletedUsers[0];
  },

  updateUser(parent, args, { db }, info) {
    const { id, data } = args

    // check if user exists in db
    const user = db.users.find((user) => user.id === id);

    // throw error if no matchin user found
    if (!user) throw new Error('User not found');

    // set email if email does not already belong to a user in the db:

    // check if email is provided:
    if (typeof data.email === 'string') {
      // check if data.email matches an existing user email
      const emailTaken = db.users.some((user) => user.email === data.email)
      // if the email already belongs to a user:
      if (emailTaken) throw new Error('This email is known');

      // otherwise, we can set the users email frm the email that gets passed in.
      user.email = data.email
    }

    // set name if name is provided
    if (typeof data.name === 'string') {
      user.name = data.name
    }

    // set age if age is provided.
    if (typeof data.age !== 'undefined') {
      // we only set age if age is not === to undefined.
      user.age = data.age
    }

    // return the updated user:
    return user

  },

  createPost(parent, args, { db }, info) {

    // verify the user exists, if user id matches the id of the author.
    const userExists = db.users.some((user) => user.id === args.data.author);
    // exit if user not found.

    if (!userExists) throw new Error('User not found');
    // define new post from passed in values:

    const post = {
      id: uuidv4(),
      ...args.data
    }

    // add new post to posts array
    db.posts.push(post)

    // return new post
    return post
  },

  deletePost(parent, args, { db }, info) {
    // check if post exists
    const postIndex = db.posts.findIndex((post) => post.id === args.id)
    // throw error if post does not exist
    if (postIndex === -1) throw new Error('post not found')
    // remove the deleted post
    const deletedPosts = db.posts.splice(postIndex, 1);
    // remove all comments associated with the post.
    db.comments = db.comments.filter((comment) => comment.post !== args.id)

    // return first item off deletedPosts array
    return deletedPosts[0]
  },

  updatePost(parent, args, { db }, info) {
    const { id, data } = args
    const post = db.posts.find((post) => post.id === id);
    if (!post) throw new Error('post not found')

    if (data.title === 'string') post.title = data.title;
    if (data.body === 'string') post.body = data.body;
    if (data.published === 'boolean') post.published = data.published;
    return post

  },

  createComment(parent, args, { db }, info) {

    const userExists = db.users.some((user) => user.id === args.data.author);
    // post must exist and must be published:
    const postExists = db.posts.some((post) => post.id === args.data.post && post.published === true);

    if (!userExists) throw new Error('User not found');
    if (!postExists) throw new Error('post not found');

    const comment = {
      id: uuidv4(),
      ...args.data
    }
    db.comments.push(comment);
    return comment;
  },

  deleteComment(parent, args, { db }, info) {
    const commentsIndex = db.comments.findIndex((comment) => comment.id === args.id);
    if (commentsIndex === -1) throw new Error('comment does not exist');
    const deletedComments = db.comments.splice(commentsIndex, 1);
    return deletedComments[0];
  },

  updateComment(parent, args, { db }, info) {
    const comment = db.comments.find((comment) => comment.id === args.id);
    if (!comment) throw new Error('No matching comment found');

    if (args.data.text) comment.text = args.data.text;

    return comment;
  },
}

export { Mutation as default }
