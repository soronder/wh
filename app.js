var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var fs = require('fs');

const { MongoClient } = require('mongodb');

var uuid = require('uuid');
// var uniq = require('lodash.uniq');
// var without = require('lodash.without');
var keyBy = require('lodash.keyby');

const dirTree = require('directory-tree');
// const imageThumbnail = require('image-thumbnail');

// var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const shared = {
    auth: {},
    state: {},
    stateChange: false,
};

// try {
//     const filePath = path.join(__dirname, 'state-backup.json');
//     if (fs.existsSync(filePath)) {
//         shared.state = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//     }
//     else {
//         shared.state = {};
//     }
// }
// catch(e) {
//     console.log('Error initializing state from file');
//     throw e;
// }

// setInterval(function() {
//     if(!shared.stateChange) {
//         return;
//     }
//     var start = new Date();
//     var hrstart = process.hrtime();

//     fs.writeFileSync(path.join(__dirname, 'state.json'), JSON.stringify(shared.state));

//     var end = new Date() - start,
//         hrend = process.hrtime(hrstart);

//     console.info('Write execution time: %dms', end);
//     console.info('Write execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);

//     shared.stateChange = false;
// }, 1000);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'client/build/static')));


const uri = "garbage mongo URL";
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

    app.get('/meta', function(req, res) {
        const path = req.query && req.query.path;
        const auth = getAuth(req);
        if(auth && path) {
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
        const path = req.query && req.query.path;
        const auth = getAuth(req);
        if(auth && path) {
            let value = { $set: { path } };
            if(req.body.comment) {
                value.$push = {
                    comments: {
                        author: auth.name,
                        time: new Date().getTime(),
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
        return null;
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
        let { name } = auth;
        return res.json({
            name: name
        });
    }
    return res.json({error: "No token provided"});
});

app.post('/login', function(req, res) {
    const name = req.body.name;
    const password = req.body.password;
    if(name && password) {
        if(password === "garbagepw") {
            const token = uuid.v4();
            shared.auth[token] = {
                name: name,
            };
            return res.json({token: token, name: name});
        }
    }
    return res.json({error: "Invalid Login"});
});

module.exports = app;
