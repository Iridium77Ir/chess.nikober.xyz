const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    try {
        res.render('index');
    } catch (err) {
        res.render('error', {error: err});
    };
});

module.exports = router