const mongoose = require('mongoose')

const chessSchema = new mongoose.Schema({
    players: {
        type: Number,
        required: true,
        default: 0
    },
    fen: {
        type: String,
        required: true,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    },
    previousfen: {
        type: String,
        required: true,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    },
    updated: {
        type: Date,
        required: true,
        default: Date.now(),
        expires: 1800
    }
})

module.exports = mongoose.model('Chess', chessSchema)