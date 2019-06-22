# Live Reload for GraphQL Yoga Server:

---------------------------------

In order to configure the server, We'll need to 

- install nodemon, 

```shell
npm i nodemon@1.17.0 --save-dev
```

> `—save-dev` flag ensures we're only depending on nodemon for our local development environement. 

- and update our start script in package.json:

```json
"start": "nodemon src/index.js --exec babel-node",
```

> directs `nodemon` to load ur index.js file while executing it thru the `babel-node` compiler

now if we run our start script:

```shell
npm run start
```



We'll have nodemon configured to watch for changes to our files, and update the server accordingly. 



We had issues with nodemon crashing on each save used: `kexec`

```shell
npm i kexec --save
```

