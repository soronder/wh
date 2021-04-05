# Example App

### Overview

This is a small Express + React web app for viewing, organizing, and commenting on lists of pictures.

Created with [Express Generator](https://expressjs.com/en/starter/generator.html) and [CRA (Create React App)](https://github.com/facebook/create-react-app) and saving records to [MongoDb](https://www.mongodb.com/).

You'll need:
- [Node.js](https://nodejs.org/en/)
- [node package manager](https://docs.npmjs.com/cli/v7/configuring-npm/install)
- a MongoDb instance - [Atlas](https://www.mongodb.com/cloud/atlas) is a good free option

### Install

```
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

### Run Locally

For development, run both the server and the client via 1 command:
```
npm run start
```

Then go to the [client url at localhost:3000](http://localhost:3000) which is set up to live-reload when files are changed and proxy backend requests to the Express server.

You can also open the [Express server at localhost:3001](http://localhost:3001) which will serve the built client files.

### Deploy

Build the client code so it can be served statically by the Express server:
```
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

This repo has already been configured to work with Glitch, but if starting from scratch, [these are the steps you'll need to follow to get CRA and Express working together](https://dev.to/glitch/create-react-app-and-express-together-on-glitch-28gi).

Once you've created a Glitch app, follow [these instructions to push to Glitch](https://glitch.happyfox.com/kb/article/85-how-do-i-push-code-that-i-created-locally-to-my-project-on-glitch/). If pushing to Glitch, you need to refresh your app to pick up the changed files by clicking "Tools ^", then "Terminal", then entering the command "refresh".

### Remember the Most Important Things

![Trying my Best by @titsay](https://github.com/soronder/wh/blob/master/server-static/images/Motivational%20Sloths/trying%20my%20best.png)

![Nothing is Impossible](https://github.com/soronder/wh/blob/master/server-static/images/Motivational%20Sloths/nothing%20is%20impossible.jpeg)