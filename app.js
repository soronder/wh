var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { MongoClient } = require('mongodb');

var uuid = require('uuid');
var keyBy = require('lodash.keyby');

const dirTree = require('directory-tree');
// const imageThumbnail = require('image-thumbnail');

// var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const shared = {
    auth: {},
};

let dbUser = process.env.DB_USER;
let dbPw = process.env.DB_PW;
let dbLoc = process.env.DB_LOC;
if (!dbUser) {
    var result = require('dotenv').config();
    if(result.error) {
        throw result.error;
    }
    dbUser = process.env.DB_USER;
    dbPw = process.env.DB_PW;
    dbLoc = process.env.DB_LOC;
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'client/build/static')));

const uri = `mongodb+srv://${dbUser}:${dbPw}@${dbLoc}.mongodb.net/whouse?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(async (err) => {
    const collection = client.db("whouse").collection("items");

    // app.use('/', indexRouter);

    app.get('/', function(req, res) {
        return res.sendFile(path.join(__dirname, 'client/build/index.html'));
    });

    app.get('/dir', function(req, res) {
        const tree = dirTree('public/images');
        return res.json(tree);
    });

    app.get('/recentlychanged', function(req, res) {
        const auth = getAuth(req);
        if(!auth) {
            return res.json({ errCode: "AUTH_EXP", error: 'Auth expired. Please sign back in.' });
        }
        return collection.find({
                updated: {$exists:true}
            }, {
                sort: {updated: -1}
            })
            .limit(10)
            .toArray()
            .then((result) => {
                return res.json(result || []);
            });
    });

    app.get('/meta', function(req, res) {
        const auth = getAuth(req);
        if(!auth) {
            return res.json({ errCode: "AUTH_EXP", error: 'Auth expired. Please sign back in.' });
        }
        const path = req.query && req.query.path;
        if(path) {
            return collection.findOne({path}).then((result) => {
                return res.json(result || {
                    description: '',
                    comments: []
                });
            });
        }
        return collection.find().toArray().then((results) => {
            let meta = keyBy(results, 'path')
            return res.json(meta);
        });
    });

    app.post('/meta', function(req, res) {
        const auth = getAuth(req);
        if(!auth) {
            return res.json({ errCode: "AUTH_EXP", error: 'Auth expired. Please sign back in.' });
        }
        const path = req.query && req.query.path;
        if(path) {
            const name = path.split('/').pop();
            const updated = new Date().getTime();
            let value = { $set: { path, name, updated } };
            if(req.body.comment) {
                value.$push = {
                    comments: {
                        author: auth.name,
                        time: updated,
                        comment: req.body.comment,
                    }
                };
            }
            if(req.body.description) {
                value.$set.description = req.body.description;
            }
            if(req.body.claimed !== undefined) {
                if(req.body.claimed) {
                    value.$addToSet = {
                        claimed: auth.name
                    };
                }
                else {
                    value.$pull = { claimed: auth.name };
                }
            }
            if(req.body.discard !== undefined) {
                value.$set.discard = req.body.discard ? true : false;
            }
            if(req.body.sold !== undefined) {
                value.$set.sold = req.body.sold ? true : false;
            }
            if(req.body.storage !== undefined) {
                value.$set.storage = req.body.storage ? true : false;
            }
            if(req.body.countdown !== undefined) {
                value.$set.countdown = req.body.countdown;
            }
            return collection.findOneAndUpdate({ path }, value, { upsert: true } )
                .then(result => {
                    if(result.ok === 1) {
                        return collection.findOne({path}).then((result) => {
                            return res.json(result);
                        });
                    }
                    return res.json({ error: 'failed to update' });
                });
        }
        return res.json({ error: 'try to attempt without record path' });
    });

    app.get('/thumb', function(req, res) {

    });

    app.use('/users', usersRouter);

    // client.close();
});

function getAuth(req) {
    const token = req.query && req.query.token;
    return (token && shared.auth[token]) || null;
}

app.get('/loginvalidate', function(req, res) {
    const auth = getAuth(req);
    if(auth) {
        return res.json({ name: auth.name });
    }
    return res.json({error: "Invalid token provided"});
});

app.post('/login', function(req, res) {
    const name = req.body.name;
    const password = req.body.password;
    if(name && password) {
        if(password === "garbagepw") {
            const token = uuid.v4();
            shared.auth[token] = {
                name: name,
                time: new Date().getTime(),
            };
            return res.json({token: token, name: name});
        }
    }
    return res.json({error: "Invalid Login"});
});

module.exports = app;
