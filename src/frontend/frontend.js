//Load .env file
require('dotenv').config();

//Import core, crucial modules
const express = require('express');
var app = express();
const expressLayouts = require('express-ejs-layouts');

//Setting the view engine, etc...
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.json());

//defining the main router, handling the rule and main page
const mainRouter = require('./routes/main');
app.use('/', mainRouter);

//defining the play router, handling the new Game functionality and the actual game
const playRouter = require('./routes/play');
app.use('/play', playRouter);

//Tell express to listen on the port defined in the .env file
app.listen(process.env.FRONTEND_PORT);