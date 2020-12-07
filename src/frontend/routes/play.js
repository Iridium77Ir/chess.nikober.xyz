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
                if(resGame.whiteAssigned == false) {
                    token.setToken(res, {color: 'w', gameid: req.params.id}, process.env.JWT_SECRET);
                    res.render('play', {gameid: req.params.gameid});
                } else if(resGame.blackAssigned == false) {
                    token.setToken(res, {color: 'b', gameid: req.params.id}, process.env.JWT_SECRET);
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

module.exports = router;