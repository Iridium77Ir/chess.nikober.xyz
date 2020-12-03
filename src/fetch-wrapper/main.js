//Load .env file
require('dotenv').config();

async function createGame(data) {
    try {
        var res = await fetch('http://localhost:' + process.env.DB_PORT + '/newGame', { method: 'POST', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify(data)});
        return res.json();
    } catch (err) {
        return {err: err};
    }
}

module.exports = createGame;