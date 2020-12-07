const express = require('express')
const router = express.Router()

//Get DB
var Chess = require('../models/chess');
//
router.post('/newGame', async (req, res) => {
    try {
        var newGame = new Chess({});
        if(req.body.color == 'b') {
            newGame.blackAssigned = true;
        } else {
            newGame.whiteAssigned = true;
        }
        var game = await newGame.save();
        res.status(200).json({game: game});
    } catch (err) {
        res.status(501).json({error: err});
    };
});
//
router.post('/getGame', async (req, res) => {
    try {
        var game = await Chess.findById(req.body.gameid);
        if(game != '' && game != null) {
            res.status(200).json({game: game});
        } else {
            res.status(401).json({error: 'Game not found'});
        };
    } catch (err) {
        res.status(501).json({error: err});
    };
});
//
router.put('/updateGame', async (req, res) => {
    try {
        var game = await Chess.findById(req.body.gameid);
        if(game != '' && game != null) {
            game.previousfen = game.fen;
            game.fen = req.body.fen;
            game.updated = Date.now();
            await game.save();
            res.status(200).json({message: 'updated'});
        } else {
            res.status(401).json({error: 'Game not found'});
        };
    } catch (err) {
        res.status(501).json({error: err});
    };
});
//
router.delete('/deleteGame', async (req, res) => {
    try {
        var game = await Chess.findById(req.body.gameid);
        if(game != '' && game != null) {
            await game.remove();
            res.status(200).json({message: 'deleted'});
        } else {
            res.status(401).json({error: 'Game not found'});
        };
    } catch (err) {
        res.status(501).json({error: err});
    };
});
//
router.put('/takebackGame', async (req, res) => {
    try {
        var game = await Chess.findById(req.body.gameid);
        if(game != '' && game != null) {
            game.fen = game.previousfen;
            await game.save();
            res.status(200).json({game: game});
        } else {
            res.status(401).json({error: 'Game not found'});
        };
    } catch (err) {
        res.status(501).json({error: err});
    };
});

module.exports = router

