# MERN Stack Journal App

Features:
- Hosted at [nickbaker.cloud](http://www.nickbaker.cloud)
- User authentication via JWT
- REST API to Create / Read / Update / Delete journals and other user data
- react-scripts used to minify scripts to optimize site load time
- Jest used for testing
- CI/CD pipelining implemented to test changes and deploy new code on the remote server to update [nickbaker.cloud](http://www.nickbaker.cloud) automatically
  - Jest mock functions used to independently test the http api and the database via dependency injection
  - Shell script used to compile & minify scripts and then combine them into a `static/` folder to optimize load times
  - The remote server hosting [nickbaker.cloud](http://www.nickbaker.cloud) will only be updated if tests pass
- Additional technologies being run on the hosting server: NGINX used as reverse proxy to optimize load times, PM2 used to manage the node process to ensure minimal downtime, Yarn used for package management, Certbot used to automatically update SSL certificates

To do:
- Add a calendar view to dashboard
- Allow users to add tags to journal entries & search by title, content, tag

Login:
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/729168aa-52ff-4055-98f0-ef65d86b508e)

Dashboard page:
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/1a7d57dd-011e-4573-973a-50c7133b9168)

Editing a journal:
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/f187bb91-dd2c-4ba9-9dc2-936fdb24959e)

# Setup (remote host)

To set up on a remote server, after cloning the repository, you will need to install dependencies, build & minify all scripts and then start a node process.
You will also need to create a `.env` file with a `MONGO_URI` variable corresponding to your MongoDB URI (`MONGO_URI="mongodb+srv://..."` and a `JWT_SECRET` variable.

Install dependencies
```
cd full-mern-stack-app/server
yarn install
cd ../client
yarn install
```

Minify scripts & start server
```
cd full-mern-stack-app/server
./deploy.sh
node index.js
```

Recommended:
- Configure NGINX to act as a reverse proxy and forward HTTP/HTTPS traffic to the node server's port
- Use PM2 to manage the node process (`pm2 start index.js --watch --ignore-watch="node_modules"`). PM2 will restart the node process if it ever crashes and will help ensure the server does not go down. Starting `index.js` in watch mode will tell PM2 to automatically restart the node process upon changes to any files.

# Setup (development)

A development environment offers many benefits, like being able to see changes to files propagate instantly. To set up a locally hosted development environment, after cloning the repository, you will need to start a React development server and a Node server.
You will also need to create a `.env` file with a `MONGO_URI` variable corresponding to your MongoDB URI (`MONGO_URI="mongodb+srv://..."` and a `JWT_SECRET` variable.

Install client dependencies & start react server:
```
cd full-mern-stack-app/client
yarn install
yarn start
```

In another terminal, install server dependencies & start the node server (using a yarn script which will run nodemon)
```
cd full-mern-stack-app/server
yarn install
yarn dev
```

*Note: All API routes in `full-mern-stack-app/client/pages/*.js` will need to be prepended with `localhost:[your node port]` as with this development setup the node server will be bound to a different port than the react server.*
