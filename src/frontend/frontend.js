//Load .env file
require('dotenv').config();

const express = require('express');
var app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser);

//Setting the view engine, etc...
app.use(express.json());

const jwt = require('jsonwebtoken');
const db_fetch = require('../fetch-wrapper/main.js');
const token = require('./token-middleware/token.js');

const expressLayouts = require('express-ejs-layouts');
//Setting the view engine, etc...
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('/public'));

//
app.get('/', async (req, res) => {
    try {
        var returnToken = token.getToken(req, process.env.JWT_SECRET);
        if(returnToken.err != undefined) {
            res.redirect(`/play/${returnToken.id}`);
        } else {
            if(returnToken.err == 'modified') {
                res.clearCookie('chess-token');
                res.render('index');
            } else if(returnToken.err == 'nocookies') {
                res.render('index');
            } else {
                res.render('index');
            };
        };
    } catch (err) {
        res.status(501).render('err', {error: err});
    };
});

//
app.post('/createGame', async (req, res) => {
    try {
        var res = await db_fetch.createGame({color: 'w'});
        var playerData = {
            color: 'w',
            gameid: res._id
        };
        token.setToken(res, playerData, process.env.JWT_SECRET);
        res.status(200).json({token: playerData});
    } catch (err) {
        res.status(501).json({error: err});
    };
});

//Routes
//defining the main router, handling the rule and main page
const playRouter = require('./routes/play');
app.use('/play', playRouter);

//Setting listen port
app.listen(process.env.FRONTEND_PORT);