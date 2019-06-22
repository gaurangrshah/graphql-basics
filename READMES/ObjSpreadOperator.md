# Object Spread Operator in Node.js

---------------------------------

 We'll be installing a plugin for babel and configuring babel to be able to use the object spread operator syntax in our project. `babel-plugin=transform-object-rest-spread`

```shell
npm i babel-plugin-transform-object-rest-spread@6.26.0
```



once installed we can configure our `babelrc`:

```json
{
  "presets": [
    "env"
  ],
  
  "plugins": [
    "transform-object-rest-spread"
  ]
  
}

```



Now we can utilize this syntax in the project, anywhere we were manually assigning object properties from arguments. 

```js
    createUser(parent, args, ctx, info) {
      /* ... */
      const user = {
        id: uuidv4(), 
        ...args
      }
		/* ... */
    },
```



