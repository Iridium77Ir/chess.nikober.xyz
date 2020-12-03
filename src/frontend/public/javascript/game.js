//Connect to socket:
var socket = io('wss://' + window.location.hostname + ':443');

//Initing the chess.js board
var game = new Chess();

//Initialising vars
let color;
var players;
var play = true;
let roomId;
var promotionPiece = 'q';

//Functions
//Leave match
function leaveMatch() {
    socket.emit('gameOver', roomId);
    eraseCookies();
}
function eraseCookies() {
    setCookie('game', '');
    setCookie('color', '');
}
//Create the grey squares that appear when hovering over tiles
var greySquare = function (square) {
    var squareEl = $('#board .square-' + square);
    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }
    squareEl.css('background', background);
};
//Remove the grey squares that appear when hovering over tiles
var removeGreySquares = function () {
    $('#board .square-55d63').css('background', '');
};
//Takeback
function offerTakeback() {
    setButton(true);
    socket.emit('offerTakeback', {id: roomId});
}

//Socket Handlers:
//Getting own color, or loading from localstorage, depending if game was already running
socket.on('color', (msg) => {
    if(msg.color != 'null') {
        setCookie('color', msg.color, 0.5);
        color = msg.color;
    } else {
        color = getCookie('color');
    }
})
//Handling errors
socket.on('errorMessage', (msg) => {
    alert('Err: ' + msg);
    eraseCookies();
})
//What happens when an opponent leaves
socket.on('opponentLeave', (msg) => {
    alert('Your opponent left the game.');
    eraseCookies();
    window.location.replace(msg);
})
//What happens if  a takeback is offered
socket.on('takebackOffered', (msg) => {
    alert('Your opponent offered a takeback!');
    var acceptButton = document.createElement('button');
    acceptButton.onclick = function() {
        socket.emit('takebackAccept', {id: roomId})
        declineButton.remove();
        acceptButton.remove();
    };
    acceptButton.innerText = 'Accept Takeback.'
    var declineButton = document.createElement('button');
    declineButton.onclick = function() {
        socket.emit('takebackReject', {id: roomId});
        declineButton.remove();
        acceptButton.remove();
    };
    declineButton.innerText = 'Decline Takeback.'
    var top = document.getElementById('takeback');
    top.appendChild(acceptButton);
    top.appendChild(declineButton);
})
socket.on('takebackResetBoard', async (msg) => {
    //setButton
    board.position(msg);
    game = new Chess(msg);
})
socket.on('noTakeback', async (msg) => {
    //setButton
})
//Changing the status indicator in the HTML
socket.on('play', function (msg) {
    play = false;
    document.getElementById('gameStatus').innerText = "Game in progress";
});
//When game starts, set board to position sent by the server
socket.on('starting', (msg) => {
    board.position(msg);
})
//When the other player moves, set the board in the position
socket.on('move', function (msg) {
    game.move(msg.move)
    board.position(msg.board);
    if(game.turn() == 'b' && color == 'white') {
        setButton(false);
    } else if(game.turn() == 'w' && color == 'black') {
        setButton(false);
    } else {
        setButton(true);
    }
});
//redirect
socket.on('redirect', (msg) => {
    window.location.replace(msg);
})
//Send the joined confirmation to receive information about onself
roomId = document.getElementById('roomId').innerText;
setCookie('game', roomId, 0.5);
socket.emit('joined', roomId);

function setButton(state) {
    document.getElementById('takebackButton').disabled = state;
}

//Chess relevant functions
var onDragStart = function (source, piece) {
    // do not pick up pieces if the game is over
    // or if it's not that side's turn
    if (game.game_over() === true || play ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (game.turn() === 'w' && color === 'black') ||
        (game.turn() === 'b' && color === 'white') ) {
            return false;
    }
};
var onDrop = function (source, target) {
    removeGreySquares();
    //Check for the moves legality
    var move = game.move({
        from: source,
        to: target,
        promotion: promotionPiece
    });
    if (game.game_over()) {
        document.getElementById('gameStatus').innerText = 'GAME OVER';
        leaveMatch();
    }
    // checkmate?
    if (game.in_checkmate()) {
        alert('Game over, checkmate');
    }
    // draw?
    else if (game.in_draw()) {
        alert('Game over, drawn position');
    }
    // illegal move
    if (move === null) return 'snapback';
    else
        socket.emit('move', { move: move, board: game.fen(), room: roomId });
     
    if(game.turn() == 'b' && color == 'white') {
        setButton(false);
    } else if(game.turn() == 'w' && color == 'black') {
        setButton(false);
    } else {
        setButton(true);
    }

};
var onMouseoverSquare = function (square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
        square: square,
        verbose: true
    });
    // exit if there are no moves available for this square
    if (moves.length === 0) return;
    // highlight the square they moused over
    greySquare(square);
    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};
var onMouseoutSquare = function (square, piece) {
    removeGreySquares();
};
var onSnapEnd = function () {
    board.position(game.fen());
};

//initialising the board:
socket.on('player', (msg) => {
    players = msg.players;
    if(players >= 2){
        play = false;
        socket.emit('play', msg.roomId);
        document.getElementById('gameStatus').innerText = "Game in Progress";
        setButton(false);
    }
    else
        document.getElementById('gameStatus').innerText = "Waiting for Second player";
        var cfg = {
            orientation: color,
            draggable: true,
            position: 'start',
            onDragStart: onDragStart,
            onDrop: onDrop,
            onMouseoutSquare: onMouseoutSquare,
            onMouseoverSquare: onMouseoverSquare,
            onSnapEnd: onSnapEnd,
            pieceTheme: 'https://koblenski.github.io/javascript/chessboardjs-0.3.0/img/chesspieces/wikipedia/{piece}.png'
        };
        board = ChessBoard('board', cfg);
        board.position(msg.board);
        game = new Chess(msg.board);
});

//Board variable
var board;