# MERN Stack Journal App

**Features:**
- Hosted at [nickbaker.cloud](http://www.nickbaker.cloud)
- Created with the MERN Stack - MongoDB, Express.js, React, Node.js
- Designed a RESTful API to Create / Read / Update / Delete journals and manage user data
- Tested back-end components using Jest
  - Jest mock functions used to independently test back-end components (e.g. the HTTP server and the database) via dependency injection
- Accomplished CI/CD with Github Actions - on pushes to the repository,
  - All tests will be run
  - If tests pass, updates will be pushed to the remote server hosting the website
- Managed user authentication via JWT
- Additional technologies used on the server hosting the website:
  - NGINX used to reduce load times through caching etc. and to more efficiently serve minified static files
  - PM2 used to ensure reliable uptime for the node process
  - Yarn used for package management
  - Certbot used to automatically update SSL certificates

**To do:**
- Front-end testing
- Create a calendar view to allow users to see when journals were created / last edited
- Allow users to tag journal entries and search search by tags when in dashboard view

**Login:**
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/31093107-fe47-4bf6-8fc3-d21e8925cf4c)

**Dashboard page:**
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/0273f0d1-a85d-431a-b435-748401098756)
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/47861914-fd99-40b3-b502-4d005142614f)

**Editing a journal:**
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/8999d2cb-efe2-4887-bf3f-c1e33471c4ef)

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

# Testing

Server-side tests:
```
cd server
yarn test
```
