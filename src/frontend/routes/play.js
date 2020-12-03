const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const token = require('../token-middleware/token.js');

router.get('/:gameid', async (req, res) => {
    try {
        var checkAuthToken = token.checkAuth(req, req.params.gameid, process.env.JWT_SECRET);
        if(checkAuthToken.result == true) {
            res.render('play', {gameid: checkAuthToken.data.gameid});
        } else if(checkAuthToken.result == false) {
            res.render('index');
        } else {
            if(checkAuthToken.err == 'nocookies') {
                res.render('index');
            } else {
                res.render('error', {error: err});
            };
        }
    } catch (err) {
        res.render('error', {error: err}); 
    };
})

module.exports = router;