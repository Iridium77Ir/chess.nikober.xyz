var saveGameinCookie = JSON.parse(getCookie('chess-token')); 
if(saveGameinCookie != "" && saveGameinCookie != null && window.location.href.match(/play\/[a-zA-Z0-9]+/i) == null) {
    window.location.replace('/play/' + saveGameinCookie.gameid);
};