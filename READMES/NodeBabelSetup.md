# Setup Node.js & Babel:

---------------------------------

```shell
npm init
```

```shell
npm i babel-cli@6.26.0 babel-preset-env@1.7.0 
```



Configure Babel: in the root of the project create a new file: `.babelrc`

```json
{
  "presets": [
    "env"
  ]
}
```



Next create our entrypoint: `src/index.js`

```react
console.log('testing')
```



Next let's add our script to compile our code via babel in `package.json`

```react
"start": "babel-node src/index.js",
```

> tells babel we'd like it to use our node server to compile the file in src/index.js



Let's run the command to make sure we get our testing message to log:

```shell
npm run start
```





## ES6 - Import / Export

---------------------------------

Now we can create some additional scripts that can get loaded by index.js to get a better idea of how babel works to convert our es6 javascript imports into our compiled application: create new file: `src/myModule.js`

```react
const message = "message from myModule.js"

export { message };
```

> **NOTE**: the script we want to make available must be exported from the file.



Which can then be imported back into `index.js`:

```react
import { message } from './myModule';

console.log('testing')
```



Currently the way we're exporting our script from `myModule.js` is called a named export, which means that we are able to import that script using the name we've assigned to it. This allows us to name several items for export from the same file:

```js
const message = "message from myModule.js"
const name = "this guy"

export { message, name };
```



And can be imported as such:

```js
import { message, name } from './myModule';

console.log('testing import', message, name)
```



The other type of import is called the `default` export:

```react
const message = "message from myModule.js"
const name = "this guy"

const location = 'Philadelphia'

export { message, name, location as default };
```

> **NOTE**: we've tagged location as  default export from our script file

```js
import location, { message, name } from './myModule';

console.log('testing import', location,  message, name)
```



We can also rename default exports if we need:

```react
import myLocation, { message, name } from './myModule';

console.log('testing import', myLocation,  message, name)
```



We may also have import default exports as such: 

```react
import myCurrentLocation from './myModule'
```

> **NOTE**: this is the standard import syntax for default exports 



We have been simply exporting strings as values, but we can also export functions in the same way:

```react
const getGreeting = ({ name }) => {
  return 'Welcome to the course';
}

export { message, name, getGreeting, location as default };
```



Then we can import it and run our script: 

```js
import myLocation, { message, name, getGreeting } from './myModule';

console.log(getGreeting("jon"));

console.log('testing import', myLocation, message, name);
```

```js
npm run start
```





Challenge:

---------------------------------

1. Create a new file: `math.js`
2. Define a add functionthat takes two arguments and adds them up
3. Define a subtract function that takes two arguements and subtracts them.
4. Set up add as a default export
5. Set up subtract as a named export
6. Import both functions into index.js
7. use both functions and print the results from each.