function is_touch_device() {
    return !!('ontouchstart' in window        // works on most browsers 
    || navigator.maxTouchPoints);       // works on IE10/11 and Surface
};

var istouch = is_touch_device();

if(!istouch) {
    document.getElementById('board').style.width = '50%';
} else {
    document.getElementById('board').style.width = '100%';
    var body = document.body;
    body.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.width = '100%';
    body.style.position = 'fixed';
    document.getElementById('rules').style.visibility = 'hidden';
    var roomIdcontainer = document.getElementById('roomIdcontainer');
    roomIdcontainer.style.visibility = 'hidden';
    roomIdcontainer.style.position = 'absolute';
}