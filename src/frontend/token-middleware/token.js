const jwt = require('jsonwebtoken');

function getToken(req, jwtSecret) {
    try {
        if(req.cookies['chess-token'] != null && req.cookies['chess-token'] != '') {
            jwt.verify(JSON.parse(req.cookies['chess-token']), jwtSecret, (err, data) => {
                if (err) return {err: 'modified'};
                var cookieData = data;
                return {gameid: cookieData.id, color: cookieData.color};
            });
        } else {
            return {err: 'nocookies'};
        }; 
    } catch (err) {
        return {err: err};
    };  
};

function setToken(res, data, jwtSecret) {
    try {
        var signedData = jwt.sign(data, jwtSecret);
        res.cookie('chess-token', JSON.stringify(signedData));   
    } catch (err) {
        
    };
}

function checkAuth(req, id, jwtSecret) {
    try {
        var reqCookie = getToken(req, jwtSecret);
        if(reqCookie.gameid == id) {
            return {result: true, data: reqCookie};
        } else {
            if(reqCookie.err == 'nocookies') {
                return {err: 'nocookies'}
            } else {
                return {result: false, data: null};
            };
        };
    } catch (err) {
        return {err: err};
    };
};

module.exports = {getToken: getToken, setToken: setToken, checkAuth: checkAuth};