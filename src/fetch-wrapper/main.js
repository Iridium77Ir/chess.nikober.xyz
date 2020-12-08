//Load .env file
require('dotenv').config();

//Get DB
var Chess = require('../frontend/models/chess');

async function createGame(data) {
    try {
        var newGame = new Chess({});
        if(data.color == 'b') {
            newGame.blackAssigned = true;
        } else {
            newGame.whiteAssigned = true;
        }
        var game = await newGame.save();
        return {game: game};
    } catch (err) {
        return {err: err};
    }
}

async function getGame(id) {
    try {
        var game = await Chess.findById(id);
        if(game != '' && game != null) {
            return {game: game};
        } else {
            return {error: 'gamenotfound'};
        };
    } catch (err) {
        return {err: err};  
    };
};

async function updateGame(id, fen) {
    try {
        var game = await Chess.findById(id);
        if(game != '' && game != null) {
            game.previousfen = game.fen;
            game.fen = fen;
            game.updated = Date.now();
            await game.save();
            return {game: game};
        } else {
            return {error: 'gamenotfound'};
        };
    } catch (err) {
        return {err: err};
    };
};

async function deleteGame(id) {
    try {
        var game = await Chess.findById(id);
        if(game != '' && game != null) {
            await game.remove();
            return {message: 'success'};
        } else {
            return {error: 'gamenotfound'};
        };
    } catch (err) {
        return {err: err};
    };
};

async function takebackGame(id) {
    try {
        var game = await Chess.findById(id);
        if(game != '' && game != null) {
            game.fen = game.previousfen;
            await game.save();
            return {game: game};
        } else {
            return {error: 'gamenotfound'};
        };
    } catch (err) {
        return {err: err};
    };
};

module.exports = {createGame: createGame, getGame: getGame, updateGame: updateGame, deleteGame: deleteGame, takebackGame: takebackGame};