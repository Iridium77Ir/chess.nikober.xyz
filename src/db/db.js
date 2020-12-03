//Load .env file
require('dotenv').config();

//Import core, crucial modules
const express = require('express');
var app = express();

//Setting the view engine, etc...
app.use(express.json());

//Connecting to mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

//Routes
//defining the main router, handling the rule and main page
const gameRouter = require('./routes/game');
app.use('/game', gameRouter);

app.listen(process.env.DB_PORT);