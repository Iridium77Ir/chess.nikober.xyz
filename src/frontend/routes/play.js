const express = require('express');
const fetch_wrapper = require('fetch-wrapper/fetch-wrapper.js');
const router = express.Router();

//Getting the new page
router.get('/', (req, res) => {
    try {
        res.render('new');
    } catch (err) {
        res.render('error', {error: err});
    };
});

//Creating a new Game and redirecting
router.post('/new', async (req, res) => {
    try {
        var game = fetch_wrapper.createGame();
        res.status(201).redirect('/play/' + game.id);
    } catch (err) {
        res.status(501).render('error', {error: err});
    };
});

//Actual game page
router.get('/:gameid', async (req, res) => {
    try {
        var game = fetch_wrapper.getGame({id: req.params.gameid});
        if(game != '' && game != null) {
            res.status(201).render('play', {id: req.params.gameid});
        } else {
            res.status(403).render('error', {error: 'This game does not exist.'});
        }
    } catch (err) {
        res.status(501).render('error', {error: err});
    };
});

module.exports = router;