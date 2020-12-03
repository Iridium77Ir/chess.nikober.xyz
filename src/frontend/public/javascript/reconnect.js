var saveGameinCookie = getCookie('game'); 
if(saveGameinCookie != "" && saveGameinCookie != null && window.location.href.match(/play\/[a-zA-Z0-9]+/i) == null) {
    window.location.replace('/play/' + saveGameinCookie);
};