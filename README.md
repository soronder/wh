# Example App

### Overview

This is a small Express + React web app for viewing, organizing, and commenting on lists of pictures.

Created with [Express Generator](https://expressjs.com/en/starter/generator.html) and [CRA (Create React App)](https://github.com/facebook/create-react-app) and saving records to [MongoDb](https://www.mongodb.com/).

You'll need:
- [Node.js](https://nodejs.org/en/)
- [node package manager](https://docs.npmjs.com/cli/v7/configuring-npm/install)
- a MongoDb instance - [Atlas](https://www.mongodb.com/cloud/atlas) is a good free option

### Install

##### Install server

Install dependencies for the server in the root directory:
```
npm install
```

##### Install client

Install dependencies for the client in the client directory:
```
cd client
npm install
```

##### Setup .env file

Add your MongoDb credentials to a file in the project root named `.env`.

Currently the code assumes you're using MongoDb's service, which will have a "Connect" button on your cluster that shows you a url like
```
mongodb+srv://databaseuser:secret1234@cluster0.j453m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

Which we'll translate to `.env` like
```
DB_USER=databaseuser
DB_PW=secret1234
DB_LOC=cluster0.j453m
SIMPLE_PW={whatever global pw you want}
```

### Run in Development

For development, you'll need to run both the server and the client.

I recommend doing this in 2 separate terminal windows.

Start the server from the root project directory:
```
npm run start
```

and client from the client directory:
```
cd client
npm run start
```

Then we go to the [client url at localhost:3001](http://localhost:3001) which is set up to live-reload when files are changed and proxy backend requests to the Express server. You could also open the [Express server at localhost:3000](http://localhost:3000) which will serve the built client files.

### Deploy

Build the client code so it can be served statically by the Express server:
```
cd client
npm run build
```

Then you're ready to deploy!

##### Deploying on Heroku

[Heroku is fairly easy to use](https://devcenter.heroku.com/articles/deploying-nodejs#deploy-your-application-to-heroku) and has a free tier that will work fine for all testing and casual uses.

First, you'll need to [install the Heroku CLI](https://devcenter.heroku.com/categories/command-line). You'll need to add the variables from your .env file (or different variables for a non-development environment) as [Config Vars in your Dashboard](https://devcenter.heroku.com/articles/config-vars#using-the-heroku-dashboard).

Once you've set up Heroku, deploying is just
```
git push heroku master
```

##### Deploying on Glitch

[Glitch](https://glitch.com/) is another great platform that lets you quickly prototype, remix other apps, and can sync via git push the same as Heroku.
- [CRA and Express together on Glitch](https://dev.to/glitch/create-react-app-and-express-together-on-glitch-28gi)
- [Pushing to Glitch from Git](https://glitch.happyfox.com/kb/article/85-how-do-i-push-code-that-i-created-locally-to-my-project-on-glitch/)

### Remember the Most Important Things

![Trying my Best by @titsay](https://github.com/soronder/wh/blob/master/public/images/Motivational%20Sloths/trying%20my%20best.png)

![Nothing is Impossible](https://github.com/soronder/wh/blob/master/public/images/Motivational%20Sloths/nothing%20is%20impossible.jpeg)