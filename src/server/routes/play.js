const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const token = require('../token-middleware/token');
const db_fetch = require('../../fetch-wrapper/main');

router.get('/:gameid', async (req, res) => {
    try {
        var checkAuthToken = token.checkAuth(req, req.params.gameid, process.env.JWT_SECRET);
        if(checkAuthToken.result == true) {
            res.render('play', {gameid: checkAuthToken.data.gameid});
        } else if(checkAuthToken.result == false) {
            res.redirect('/');
        } else {
            if(checkAuthToken.err == 'nocookies') {
                var resGame = await db_fetch.getGame(req.params.gameid);
                if(resGame.game.whiteAssigned == false) {
                    token.setToken(res, {color: 'w', gameid: req.params.gameid}, process.env.JWT_SECRET);
                    res.render('play', {gameid: req.params.gameid});
                } else if(resGame.game.blackAssigned == false) {
                    token.setToken(res, {color: 'b', gameid: req.params.gameid}, process.env.JWT_SECRET);
                    res.render('play', {gameid: req.params.gameid});
                } else {
                    res.render('error', {error: "This game is already full or doesn't exist!"})
                };
            } else {
                res.render('error', {error: 'There was an error'});
            };
        }
    } catch (err) {
        res.render('error', {error: err}); 
    };
})

//The socket.io part:
//Import socket.io and create a server at the port specified in the .env file
const io = require('socket.io')(process.env.WEBSOCKET_PORT);

//function to send the Error to both players
function sendError(socket, err) {
    socket.emit('errorMessage', {error: err});
    socket.broadcast.emit('errorMessage', {error: err});
}

function authenticate(token, id) {
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) return false;
        if (data.id != id) return false;
        return true;
    });
}

io.on('connection', function (socket) {
    //What happens when a players joins
    socket.on('joined', async function (data) {
        try {
            if(authenticate(data.token, data.id) == false) {
                socket.emit('error', {error: 'tokenerror'});
            } else {
                var game = await db_fetch.getGame(data.id);
                if(!game.hasOwnProperty('err')) {
                    socket.join(game.game.id);
                    socket.emit('fen', {fen: game.game.fen});
                };
            };
        } catch (err) {
            sendError(socket, err);
        };
    });
    //What happens when a player moves a piece
    socket.on('move', async function (data) {
        try {
            if(authenticate(data.token, data.id) == false) {
                socket.emit('error', {error: 'tokenerror'});
            } else {
                var game = await db_fetch.updateGame(data.id, data.fen);
                if(!game.hasOwnProperty('err')) {
                    socket.broadcast.emit('move', data);
                };
            };
        } catch (err) {
            sendError(socket, err);
        };
    });
    //Sending the message that the game begins | TODO: Maybe add move verification server side.
    socket.on('play', function (data) {
        try {
            if(authenticate(data.token, data.id) == false) {
                socket.emit('error', {error: 'tokenerror'});
            } else {           
                socket.broadcast.emit('play', data);
            };
        } catch (err) {
            sendError(socket, err);
        };
    });
    //Game over notice is sent to both players, the game is deleted
    socket.on('gameOver', async (data) => {
        try {
            if(authenticate(data.token, data.id) == false) {
                socket.emit('error', {error: 'tokenerror'});
            } else {
                var game = await db_fetch.deleteGame(data.id);
                if(!game.hasOwnProperty('err')) {
                    socket.emit('redirect', '/');
                    socket.broadcast.emit('opponentLeave', '/');
                } else {
                    sendError(socket, 'Could not delete Game.');
                };
            };
        } catch (err) {
            sendError(socket, err);
        };
    });
    //A player offered takeback
    socket.on('offerTakeback', async (data) => {
        try {
            if(authenticate(data.token, data.id) == false) {
                socket.emit('error', {error: 'tokenerror'});
            } else {
                socket.broadcast.emit('takebackOffered', data);
            };
        } catch (err) {
            sendError(socket, err);
        }
    });
    //The other player accepted the takeback
    socket.on('takebackAccept', async (data) => {
        try {
            if(authenticate(data.token, data.id) == false) {
                socket.emit('error', {error: 'tokenerror'});
            } else {
                var game = await db_fetch.takebackGame(data.id);
                if(!game.hasOwnProperty('err')) {
                    socket.emit('takebackResetBoard', game.game.previousfen);
                    socket.broadcast.emit('takebackResetBoard', game.game.previousfen); 
                } else {
                    sendError(socket, 'Could not takeback Game.');
                };
            };
        } catch (err) {
            sendError(socket, err)
        }
    });
    //The other player accepted the takeback
    socket.on('takebackReject', async (data) => {
        try {
            if(authenticate(data.token, data.id) == false) {
                socket.emit('error', {error: 'tokenerror'});
            } else {
                socket.emit('noTakeback');
                socket.broadcast.emit('noTakeback');
            };
        } catch (err) {
            sendError(socket, err)
        };
    });
});

module.exports = router;