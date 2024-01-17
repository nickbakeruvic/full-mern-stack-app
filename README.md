# MERN Stack Journal App

Features:
- Hosted at [nickbaker.cloud](http://www.nickbaker.cloud)
- User authentication via JWT
- REST API to Create / Read / Update / Delete journals and other user data
- Yarn for package management
- react-scripts used to minify scripts to optimize site load time
- On the host server, NGINX used as reverse proxy to throttle, optimize load times via caching, etc. & PM2 used to manage the node process to ensure minimal downtime

To do:
- Set up a CI/CD pipline to automatically pull new changes, minify new scripts, and restart the node process on the Ubuntu server hosting the site (likely will implement via github actions)
- Add a calendar view to dashboard
- Allow users to add tags to journal entries & search by title, content, tag
- Support HTTPS (NGINX configuration)

Login:
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/729168aa-52ff-4055-98f0-ef65d86b508e)

Dashboard page:
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/1a7d57dd-011e-4573-973a-50c7133b9168)

Editing a journal:
![image](https://github.com/nickbakeruvic/full-mern-stack-app/assets/106908272/f187bb91-dd2c-4ba9-9dc2-936fdb24959e)

# Setup (remote host)

To set up on a remote server, after cloning the repository, you will need to install dependencies, build & minify all scripts and then start a node process.
You will also need to replace `mongoose.connect('mongodb+srv://xxx')` in `full-mern-stack-app/server/index.js` with your MongoDB URI.

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
- Configure NGINX to sit in front of your server and forward traffic from port 80 / 443 to your node server's port so that standard http / https traffic is routed to your server directly
- Use PM2 to manage the node process (`pm2 start index.js`). PM2 will restart the node process if it ever crashes and will help ensure the server does not go down.

# Setup (development)

A development environment offers many benefits, like being able to see changes to files propagate instantly. To set up a locally hosted development environment, after cloning the repository, you will need to start a React development server and a Node server.
You will also need to replace `mongoose.connect('mongodb+srv://xxx')` in `full-mern-stack-app/server/index.js` with your MongoDB URI.

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

*Note: All API routes in `full-mern-stack-app/client/pages/*.js` will need to be prepended with `localhost:1337` assuming the node server is hosted on port 1337 of your localhost.
e.g. `await fetch('/api/journals)` should become `await fetch('http://localhost:1337/api/journals'`. Additionally, lines 13 and 144-147 of `full-mern-stack-app/server/index.js` will need to be removed (as there are no static files to serve).*
