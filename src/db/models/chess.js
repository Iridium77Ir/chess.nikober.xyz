const mongoose = require('mongoose')

const chessSchema = new mongoose.Schema({
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
    },
    blackAssigned: {
        type: Boolean,
        required: true,
        default: false,
    },
    WhiteAssigned: {
        type: Boolean,
        required: true,
        default: false,
    }
})

module.exports = mongoose.model('Chess', chessSchema)