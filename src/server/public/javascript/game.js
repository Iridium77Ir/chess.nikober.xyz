//Connect to socket:
var socket = io('wss://' + window.location.hostname + ':443');

//Get jwt
var token = parseJwt(getCookie('chess-token'));

//Initing the chess.js board
var game = new Chess();

//Initialising vars
let color = token.color;
var play = true;
let roomId;
var promotionPiece = 'q';
var hasPressed = false;

//Functions
//Leave match
function leaveMatch() {
    socket.emit('gameOver', {token: token, id: roomId});
    eraseCookie('chess-token');
};
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
    if(!hasPressed) {
        setButton(true);
        socket.emit('offerTakeback', {token: token, id: roomId});
        hasPressed = true;
        setButton(true);
    };
}

//Socket Handlers:
//Handling errors
socket.on('errorMessage', (data) => {
    alert('Err: ' + data.error);
    eraseCookie('chess-token');
})
//What happens when an opponent leaves
socket.on('opponentLeave', (data) => {
    alert('Your opponent left the game.');
    eraseCookie('chess-token');
    window.location.replace(data);
})
//What happens if  a takeback is offered
socket.on('takebackOffered', (data) => {
    alert('Your opponent offered a takeback!');
    var acceptButton = document.createElement('button');
    acceptButton.onclick = function() {
        socket.emit('takebackAccept', {token: token, id: roomId})
        declineButton.remove();
        acceptButton.remove();
    };
    acceptButton.innerText = 'Accept Takeback.'
    var declineButton = document.createElement('button');
    declineButton.onclick = function() {
        socket.emit('takebackReject', {token: token, id: roomId});
        declineButton.remove();
        acceptButton.remove();
    };
    declineButton.innerText = 'Decline Takeback.'
    var top = document.getElementById('takeback');
    top.appendChild(acceptButton);
    top.appendChild(declineButton);
})
socket.on('takebackResetBoard', async (data) => {
    //setButton
    board.position(data);
    game = new Chess(data);
})
socket.on('noTakeback', async (data) => {
    alert('Your opponent declined a takeback');
})
//Takeback not allowed
socket.on('takebackNotAllowed', async (data) => {
    alert('You currently cannot takeback');
    setButton(true);
    hasPressed = true;
})
//Changing the status indicator in the HTML
socket.on('play', function (data) {
    play = false;
    document.getElementById('gameStatus').innerText = "Game in progress";
});
//When the other player moves, set the board in the position
socket.on('move', function (data) {
    game.move(data.move)
    board.position(data.fen);
    if(game.turn() == 'b' && color == 'w') {
        setButton(false);
    } else if(game.turn() == 'w' && color == 'b') {
        setButton(false);
    } else {
        setButton(true);
    };
    hasPressed = false;
});
//redirect
socket.on('redirect', (data) => {
    window.location.replace(data);
})
//Send the joined confirmation to receive information about onself
roomId = document.getElementById('roomId').innerText;
socket.emit('joined', {token: token, id: roomId});

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
        socket.emit('move', {token: token, move: move, fen: game.fen(), id: roomId });
     
    if(game.turn() == 'b' && color == 'w' && !hasPressed) {
        setButton(false);
    } else if(game.turn() == 'w' && color == 'b' && !hasPressed) {
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
socket.on('fen', (data) => {
    play = false;
    socket.emit('play', {token: token, id: roomId});
    setButton(false);
    document.getElementById('gameStatus').innerText = "Waiting for Second player";
    var cfg = {
        orientation: ((color == 'w') ? ('white') : ('black')),
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
    board.position(data.fen);
    game = new Chess(data.fen);
    setButton(true);
});

//Board variable
var board;