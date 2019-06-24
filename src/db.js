// Demo user data
let users = [
  {
    id: '1',
    name: 'Jane',
    email: 'info@infoesque.net'
  },
  {
    id: '2',
    name: 'John',
    email: 'info2@infoesque.net'
  },
  {
    id: '3',
    name: 'Mike',
    email: 'info3@infoesque.net'
  }
]

let posts = [
  {
    id: '001',
    title: 'Post Title 1',
    body: 'Some Lorem for post 1',
    published: true,
    author: '1'
  },
  {
    id: '002',
    title: 'Post Title 2',
    body: 'Some Lorem for post 2',
    published: true,
    author: '1'
  },
  {
    id: '003',
    title: 'Post Title 3',
    body: 'Some Lorem for post 3',
    published: false,
    author: '3'
  }
]

let comments = [
  {
    id: '001',
    text: 'comment for 1',
    author: '2',
    post: '001'
  },
  {
    id: '002',
    text: 'comment for 2',
    author: '3',
    post: '003'
  },
  {
    id: '003',
    text: 'comment for 3',
    author: '3',
    post: '001'
  },
  {
    id: '004',
    text: 'comment for 4',
    author: '1',
    post: '003'
  }
]

const db = {
  users,
  posts,
  comments
}

export { db as default }
