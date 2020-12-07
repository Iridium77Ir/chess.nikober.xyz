//Load .env file
require('dotenv').config();

async function createGame(data) {
    try {
        var res = await fetch('http://localhost:' + process.env.DB_PORT + '/newGame', { method: 'POST', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify(data)});
        return res.json();
    } catch (err) {
        return {err: err};
    }
}

async function getGame(id) {
    try {
        var res = await fetch('http://localhost:' + process.env.DB_PORT + '/getGame', { method: 'GET', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify({gameid: id})});
        res = res.json();
        if(res.error == undefined) {
            return {game: res.game};
        } else {
            return {error: res};
        }
    } catch (err) {
        return {err: err};  
    };
};

async function updateGame(id, fen) {
    try {
        var res = await fetch('http://localhost:' + process.env.DB_PORT + '/updateGame', { method: 'PUT', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify({gameid: id, fen: fen})});
        res = res.json();
        if(res.error == undefined) {
            return {message: res.message};
        } else {
            return {error: res};
        }
    } catch (err) {
        return {err: err};
    };
};

async function deleteGame(id) {
    try {
        var res = await fetch('http://localhost:' + process.env.DB_PORT + '/deleteGame', { method: 'DELETE', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify({gameid: id})});
        res = res.json();
        if(res.error == undefined) {
            return {message: res.message};
        } else {
            return {error: res};
        }
    } catch (err) {
        return {err: err};
    };
};

async function takebackGame(id) {
    try {
        var res = await fetch('http://localhost:' + process.env.DB_PORT + '/takebackGame', { method: 'PUT', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify({gameid: id})});
        res = res.json();
        if(res.error == undefined) {
            return {game: res.game};
        } else {
            return {error: res};
        }
    } catch (err) {
        return {err: err};
    };
};

module.exports = createGame, getGame, updateGame, deleteGame, takebackGame;